import Counter from "../models/Counter.js";

export async function nextOrderNo() {
  const counter =
    await Counter.findOneAndUpdate(
      {
        name: "order_no",
      },
      {
        $inc: {
          value: 1,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

  return counter.value;
}