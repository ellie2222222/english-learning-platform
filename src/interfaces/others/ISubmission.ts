import { UserTestStatusEnumType } from "../../enums/UserTestStatusEnum";

export interface ISubmitTest {
  testId: string;
  userId: string;
  answers: {
    exerciseId: string;
    selectedAnswers: string[];
  }[];
}

export interface ISubmitExercises {
  lessonId: string;
  userId: string;
  answers: {
    exerciseId: string;
    selectedAnswers: string[];
  }[];
}

export interface IUserTestResponse {
  id: string;
  testId: string;
  userId: string;
  attemptNo: number;
  score: number;
  status: UserTestStatusEnumType;
  description: string;
  submittedAt: Date;
  results: {
    exerciseId: string;
    selectedAnswers: string[];
    correctAnswers: string[];
    isCorrect: boolean;
  }[];
}

export interface IUserExerciseResponse {
  userId: string;
  submittedAt: Date;
  results: {
    exerciseId: string;
    selectedAnswers: string[];
    correctAnswers: string[];
    isCorrect: boolean;
  }[];
}