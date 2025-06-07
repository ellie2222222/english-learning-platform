import { Inject, Service } from "typedi";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import { IReceipt } from "../interfaces/models/IReceipt";
import { IPaymentQueue } from "../interfaces/queue/IPaymentQueue";
import { closeConnection, createConnection } from "../utils/queueUtils";
import PaymentService from "../services/PaymentService";
import { IPaymentService } from "../interfaces/services/IPaymentService";
import getLogger from "../utils/logger";
const logger = getLogger("PAYMENT_QUEUE");
const PAYMENT_QUEUE_NAME = "Payment_queue";
@Service()
class PaymentQueue implements IPaymentQueue {
  constructor(
    @Inject(() => PaymentService) private paymentService: IPaymentService
  ) {}

  sendPaymentData = async (data: object): Promise<void> => {
    const { connection, channel } = await createConnection();

    try {
      await channel.assertQueue(PAYMENT_QUEUE_NAME, { durable: true });
      channel.sendToQueue(
        PAYMENT_QUEUE_NAME,
        Buffer.from(JSON.stringify(data))
      );
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    } finally {
      await closeConnection(connection, channel);
    }
  };

  consumePaymentData = async (): Promise<IReceipt | null> => {
    const { connection, channel } = await createConnection();
    let receipt = null;

    try {
      await channel.assertQueue(PAYMENT_QUEUE_NAME, { durable: true });

      await new Promise<void>((resolve, reject) => {
        channel.consume(
          PAYMENT_QUEUE_NAME,
          async (msg) => {
            if (msg) {
              try {
                const data = JSON.parse(msg.content.toString());
                const formatedAmount =
                  data.totalAmount.currency === "VND"
                    ? data.totalAmount.value
                    : data.totalAmount.value * 25000;
                receipt = (await this.paymentService.handleSuccessPayment(
                  data.userId,
                  data.membershipPackageId,
                  data.transactionId,
                  formatedAmount,
                  (data.paymentMethod as string).toLocaleLowerCase(),
                  (data.paymentGateway as string).toLocaleLowerCase()
                )) as IReceipt;

                channel.ack(msg);
                resolve();
              } catch (processingError) {
                logger.error("Error processing message:", processingError);
                // Optionally, you can move the message to a DLQ here
                channel.nack(msg, false, false); // Do not re-queue the message
                reject(processingError);
              }
            } else {
              logger.error("No message returned");
              resolve();
            }
          },
          { noAck: false }
        );
      });
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    } finally {
      await closeConnection(connection, channel);
    }
    return receipt;
  };
}

export default PaymentQueue;
