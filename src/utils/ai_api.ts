import {
  HfInference,
  InferenceClient,
  InferenceProviderOrPolicy,
} from "@huggingface/inference";
import dotenv from "dotenv";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
dotenv.config();

const sendPromptToAIWithRule = async (rule: string, prompt: string) => {
  const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

  const chatCompletion = await client.chatCompletion({
    provider: process.env.HUGGINGFACE_AI_PROVIDER as InferenceProviderOrPolicy,
    model: process.env.HUGGINGFACE_AI_MODEL,
    messages: [
      { role: "system", content: rule },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return chatCompletion.choices[0].message;
};

export { sendPromptToAIWithRule };
