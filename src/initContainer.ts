// src/initContainer.ts
import "reflect-metadata";
import { Container } from "typedi";
import Database from "../db/database";

export default () => {
  // This triggers DB connection when container initializes
  Container.get(Database);
};
