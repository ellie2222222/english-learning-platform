import { NextFunction, Request, Response } from "express";
import { Inject, Service } from "typedi";
import AIService from "../services/AIService";
import { IAIService } from "../interfaces/services/IAIService";
import StatusCodeEnum from "../enums/StatusCodeEnum";

@Service()
class AIController {
  constructor(@Inject(() => AIService) private aiService: IAIService) {}

  askEnglishTutorAI = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { question } = req.body;
      const response = await this.aiService.askEnglishTutorAI(question);

      res.status(StatusCodeEnum.OK_200).json({
        response: response,
        message: "AI response successful",
      });
    } catch (error) {
      next(error);
    }
  };

  getPersonalizeLearningRecommendation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;

      const { referenceData, response } =
        await this.aiService.getPersonalizeLearningRecommendation(
          id,
          requesterId
        );

      res.status(StatusCodeEnum.OK_200).json({
        referenceData: referenceData,
        response: response,
        message: "AI response successful",
      });
    } catch (error) {
      next(error);
    }
  };
}
export default AIController;
