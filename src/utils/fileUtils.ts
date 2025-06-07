import dotenv from "dotenv";
import path from "path";
import { JSDOM } from "jsdom";
import sanitizeHtml from "sanitize-html";
import fs from "fs/promises";

import he from "he";
import cloudinary from "../configs/cloudinaryConfig";
import getLogger from "./logger";
const logger = getLogger("FILE_UTILS");
dotenv.config();

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const deleteFile = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath);
    logger.info(`Deleted local file ${filePath}`);
  } catch (err) {
    logger.error(
      `Failed to delete local file ${filePath}: ${(err as Error).message}`
    );
    throw err;
  }
};

const deleteCloudinaryFile = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info(`Deleted Cloudinary file ${publicId}`);
  } catch (err) {
    logger.error(
      `Failed to delete Cloudinary file ${publicId}: ${(err as Error).message}`
    );
    throw err;
  }
};

const formatPathSingle = (
  file: Express.Multer.File,
  cloudinaryUrl?: string
): string => {
  if (process.env.STORAGE_TYPE === "cloudinary" && cloudinaryUrl) {
    return cloudinaryUrl;
  }
  return `${process.env.SERVER_URL}/${file.path.replace(/\\/g, "/")}`;
};

const formatPathArray = (
  files: Express.Multer.File[],
  cloudinaryUrls?: string[]
): string[] => {
  if (process.env.STORAGE_TYPE === "cloudinary" && cloudinaryUrls) {
    return cloudinaryUrls;
  }
  return files.map(
    (file) => `${process.env.SERVER_URL}/${file.path.replace(/\\/g, "/")}`
  );
};

//create
const cleanUpFile = async (
  file: Express.Multer.File | string,
  usage: "create" | "update"
): Promise<void> => {
  try {
    if (usage === "create") {
      const filePath = path
        .join((file as Express.Multer.File).path)
        .replace(/\\/g, "/");
      logger.info(`Attempting to clean up temporary file: ${filePath}`);
      if (await fileExists(filePath)) {
        await deleteFile(filePath);
      } else {
        logger.warn(
          `Temporary file ${filePath} does not exist, skipping cleanup`
        );
      }
    } else {
      const fileUrl = file as string;
      logger.info(`Attempting to clean up file: ${fileUrl}`);
      if (fileUrl.includes(process.env.SERVER_URL || "")) {
        const filePath = path
          .join(fileUrl.replace(`${process.env.SERVER_URL}/`, ""))
          .replace(/\\/g, "/");
        logger.info(`Cleaning up local file: ${filePath}`);
        if (await fileExists(filePath)) {
          await deleteFile(filePath);
        } else {
          logger.warn(
            `Local file ${filePath} does not exist, skipping cleanup`
          );
        }
      } else {
        // Extract public_id from Cloudinary URL
        const urlParts = fileUrl.split("/");
        const fileName = urlParts.pop()?.split(".")[0] || "";
        const fieldName = urlParts.pop() || "";
        const prefix = urlParts.pop() || "";
        const publicId = `${prefix}/${fieldName}/${fileName}`;
        logger.info(`Cleaning up Cloudinary file with public_id: ${publicId}`);
        await deleteCloudinaryFile(publicId);
      }
    }
  } catch (err) {
    logger.error(`Cleanup failed for file ${file}: ${(err as Error).message}`);
  }
};

const cleanUpFileArray = async (
  files: Express.Multer.File[] | string[],
  usage: "create" | "update"
): Promise<void> => {
  if (files.length === 0) return;
  await Promise.all(
    files.map(async (file) => {
      await cleanUpFile(file, usage);
    })
  );
};

const uploadToCloudinary = async (
  file: Express.Multer.File
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `ELM_Platform/${file.fieldname}`,
      public_id: `${file.filename.split(".")[0]}`,
    });
    // Delete temporary local file
    await deleteFile(file.path);
    return result.secure_url;
  } catch (err) {
    logger.error(`Cloudinary upload failed: ${(err as Error).message}`);
    throw err;
  }
};

const uploadToCloudinaryArray = async (
  files: Express.Multer.File[]
): Promise<string[]> => {
  const urls = await Promise.all(
    files.map(async (file) => await uploadToCloudinary(file))
  );
  return urls;
};

export const decodedHtml = (content: string): string => {
  // Step 1: Handle JSON-escaped characters
  let decoded = content.replace(/\\n/g, "\n").replace(/\\"/g, '"');

  // Step 2: Decode HTML entities (e.g., & to &, < to <)
  return he.decode(decoded);
};

const extractAndReplaceImages = (
  content: string,
  attachments: string[],
  remainingImages: string[]
): string => {
  let adjustedContent = (content: string): string => {
    return content
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/&copy;/g, "©")
      .replace(/&reg;/g, "®")
      .replace(/&trade;/g, "™")
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
      .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) =>
        String.fromCharCode(parseInt(hex, 16))
      );
  };

  const formatedContent = adjustedContent(content);

  if (!content || !attachments.length) return content;

  const cleanContent = sanitizeHtml(formatedContent, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      img: ["src", "alt", "width", "height", "style", "class"],
      "*": ["style", "class"],
    },
  });

  // Parse and process
  const dom = new JSDOM(cleanContent);
  const document = dom.window.document;
  const images = document.querySelectorAll("img");

  let attachmentIndex = 0;

  images.forEach((img) => {
    let src = img.src;

    // Clean up the src attribute
    src = src.replace(/&quot;/g, '"').replace(/\\"/g, '"');

    if (src.startsWith('"') && src.endsWith('"')) {
      src = src.slice(1, -1);
    }
    if (src.startsWith('\\"') && src.endsWith('\\"')) {
      src = src.slice(2, -2);
    }
    if (src.startsWith("?")) {
      src = src.slice(1);
    }

    if (remainingImages.includes(src)) {
      // Update the img src to the clean version
      img.src = src;
      return;
    }

    if (attachmentIndex < attachments.length) {
      img.src = attachments[attachmentIndex];
      attachmentIndex++;

      const wrapper = document.createElement("div");
      wrapper.style.display = "flex";
      wrapper.style.justifyContent = "center";
      wrapper.style.alignItems = "center";
      wrapper.style.width = "100%";

      img.style.width = "100%";
      img.style.height = "auto";
      img.style.maxWidth = "600px";

      wrapper.appendChild(img.cloneNode(true));
      img.replaceWith(wrapper);
    }
  });

  // Final cleanup of any remaining encoded quotes
  let finalContent = document.body.innerHTML;
  finalContent = finalContent.replace(/&quot;/g, '"');

  return finalContent;
};

const extractImageUrlsFromContent = (content: string) => {
  const dom = new JSDOM(content);
  const document = dom.window.document;
  const images = document.querySelectorAll("img");

  let urls: string[] = [];
  images.forEach((image) => {
    let src = image.src;
    // Remove surrounding quotes and backslashes only if they exist
    if (src.startsWith('"') && src.endsWith('"')) {
      src = src.slice(1, -1);
    }
    if (src.startsWith('\\"') && src.endsWith('\\"')) {
      src = src.slice(2, -2);
    }
    // Replace any remaining escaped quotes within the string
    src = src.replace(/\\"/g, '"');
    urls.push(src);
  });

  return urls;
};

export {
  extractImageUrlsFromContent,
  extractAndReplaceImages,
  formatPathSingle,
  formatPathArray,
  cleanUpFile,
  cleanUpFileArray,
  uploadToCloudinary,
  uploadToCloudinaryArray,
  deleteCloudinaryFile,
};
