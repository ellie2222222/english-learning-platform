import { Inject, Service } from "typedi";
import { IAIService } from "../interfaces/services/IAIService";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { sendPromptToAIWithRule } from "../utils/aiApi";
import UserCourseRepository from "../repositories/UserCourseRepository";
import { IUserCourseRepository } from "../interfaces/repositories/IUserCourseRepository";
import UserRepository from "../repositories/UserRepository";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import UserEnum from "../enums/UserEnum";
import UserTestRepository from "../repositories/UserTestRepository";
import { IUserTestRepository } from "../interfaces/repositories/IUserTestRepository";

@Service()
class AIService implements IAIService {
  constructor(
    @Inject(() => UserCourseRepository)
    private userCourseRepository: IUserCourseRepository,
    @Inject(() => UserRepository)
    private userRepository: IUserRepository,
    @Inject(() => UserTestRepository)
    private userTestRepository: IUserTestRepository
  ) {}
  askEnglishTutorAI = async (
    prompt: string,
    userId?: string
  ): Promise<string> => {
    try {
      if (!userId) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Authentication is required"
        );
      }

      const requester = await this.userRepository.getUserById(userId);
      if (!requester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      if (
        (requester.activeUntil === null ||
          new Date(requester.activeUntil) < new Date()) &&
        requester.role !== UserEnum.ADMIN
      ) {
        throw new CustomException(
          StatusCodeEnum.PaymentRequired_402,
          "This feature requires membership"
        );
      }
      const rule =
        "You are an English tutor for Vietnamese learners." +
        " Always encourage users to use English." +
        " Only respond to questions that are related to learning English (vocabulary, grammar, pronunciation, etc.)." +
        " If the user writes in Vietnamese, respond only if the question is clearly about English." +
        "If the message is irrelevant or in another language, kindly remind the user to stay focused on English learning.";

      const response = await sendPromptToAIWithRule(rule, prompt);

      const finalResponse = response.content?.split("</think>").pop()?.trim();

      return finalResponse as string;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  };

  getPersonalizeLearningRecommendation = async (
    userId: string,
    requesterId: string
  ): Promise<{
    referenceData: object[];
    response: {
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
      summary: string;
    };
  }> => {
    try {
      const requester = await this.userRepository.getUserById(requesterId);

      if (!requester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      if (
        (requester.activeUntil === null ||
          new Date(requester.activeUntil) < new Date()) &&
        requester.role !== UserEnum.ADMIN
      ) {
        throw new CustomException(
          StatusCodeEnum.PaymentRequired_402,
          "This feature requires membership"
        );
      }

      const notAdmin = requester?.role !== UserEnum.ADMIN;
      const notOwner = requesterId.toString() !== userId.toString();

      if (notAdmin && notOwner) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You are not authorized to access this resource"
        );
      }

      const rule =
        "You are a learning advisor AI for an e-learning platform, analyzing user progress data to provide personalized insights and recommendations. " +
        "The input is a JSON object or stringified JSON containing user progress, including UserCourse (course progress, lessonFinished, averageScore, status), UserTest (test scores, attempts, status), Course (course details), Lessons (lesson details), and UserTests (test details with linked lessons). " +
        "Your task is to: " +
        "1. Identify the user's strengths (e.g., high test scores, high accuracy rate in certain focus/exercise type based on test description, completed lessons, consistent progress). " +
        "2. Identify the user's weaknesses (e.g., low test scores, low accuracy rate in certain focus/exercise type based on test description, incomplete lessons, stalled progress). " +
        "3. Provide specific, actionable recommendations to improve weaknesses and build on strengths (e.g., revisit lessons, take practice tests, adjust study pace). " +
        "4. Summarize the user's overall progress and potential next steps. " +
        "Always respond in clear, encouraging English, suitable for learners. " +
        "If the input is invalid (e.g., not JSON or unrelated data), return a message asking for valid user progress data. " +
        "Structure the response as a JSON object with fields: strengths (array of strings), weaknesses (array of strings), recommendations (array of strings), and summary (string). " +
        "Do not include any code or implementation details in the response, only the analysis and advice.";

      const userCourse = await this.userCourseRepository.countCompletedByUserId(
        userId
      );

      if (userCourse === 0) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Insufficient data to generate progress hierarchy"
        );
      }

      const userTest = await this.userTestRepository.countUserTestByUserId(
        userId
      );

      if (userTest === 0) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Insufficient data to generate progress hierarchy"
        );
      }

      const dataStructure =
        await this.userCourseRepository.getUserProgressHierarchy(userId);
      if (!userCourse) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "User course not found"
        );
      }

      const response = await sendPromptToAIWithRule(
        rule,
        JSON.stringify(dataStructure)
      );

      // Initialize the default response object
      let finalResponse: {
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
        summary: string;
      } = {
        strengths: [],
        weaknesses: [],
        recommendations: [],
        summary: "",
      };

      if (response.content) {
        // Extract the JSON string after </think> or use the entire content if </think> is not present
        let jsonString = response.content.trim();

        // Remove code fences if present
        if (jsonString.startsWith("```json")) {
          jsonString = jsonString
            .replace(/^```json/, "")
            .replace(/```$/, "")
            .trim();
        }

        // Try to extract the first {...} block if extra text is present
        const match = jsonString.match(/{[\s\S]*}/);
        if (match) {
          jsonString = match[0];
        }

        if (!jsonString) {
          throw new CustomException(
            StatusCodeEnum.BadRequest_400,
            "Invalid AI response: No valid JSON content found"
          );
        }

        // console.log(jsonString);
        try {
          // Parse the JSON string
          const parsedResponse = JSON.parse(jsonString);

          // Validate and assign fields to finalResponse
          finalResponse = {
            strengths: Array.isArray(parsedResponse.strengths)
              ? parsedResponse.strengths
              : [],
            weaknesses: Array.isArray(parsedResponse.weaknesses)
              ? parsedResponse.weaknesses
              : [],
            recommendations: Array.isArray(parsedResponse.recommendations)
              ? parsedResponse.recommendations
              : [],
            summary:
              typeof parsedResponse.summary === "string"
                ? parsedResponse.summary
                : "",
          };
        } catch (parseError) {
          throw new CustomException(
            StatusCodeEnum.BadRequest_400,
            "Invalid AI response format: Expected valid JSON"
          );
        }
      } else {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Invalid AI response: No content received"
        );
      }

      return { referenceData: dataStructure, response: finalResponse };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  };
}
export default AIService;
