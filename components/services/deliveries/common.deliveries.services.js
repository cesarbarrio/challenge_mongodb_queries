import Deliveries from "@/models/Deliveries.model";
import Products from "@/models/Products.model";

const find = async (req) => {
  // some vars
  let query = {};
  let limit = req.body.limit
    ? req.body.limit > 100
      ? 100
      : parseInt(req.body.limit)
    : 100;
  let skip = req.body.page
    ? (Math.max(0, parseInt(req.body.page)) - 1) * limit
    : 0;
  let sort = { _id: 1 };

  //Filter from dates
  let conditionals = [];

  if (req.body.dateFrom) {
    conditionals.push({ when: { $gte: req.body.dateFrom } });
  }

  if (req.body.dateTo) {
    conditionals.push({ when: { $lt: req.body.dateTo } });
  }

  if (req.body.weight) {
    let products = await Products.find(
      { weight: { $gte: req.body.weight } },
      { _id: 1 }
    );

    products = products.map((item) => item._id);

    conditionals.push({
      products: { $in: products },
    });
  }

  query = {
    $and: conditionals,
  };

  let totalResults = await Deliveries.find(query).countDocuments();

  if (req.body.weight) {
  }

  if (totalResults < 1) {
    throw {
      code: 404,
      data: {
        message: `We couldn't find any delivery`,
      },
    };
  }

  let deliveries = await Deliveries.find(query)
    .skip(skip)
    .sort(sort)
    .limit(limit)
    .populate("products");

  return {
    totalResults: totalResults,
    deliveries,
  };
};

const create = async (req) => {
  try {
    await Deliveries.create(req.body);
  } catch (e) {
    throw {
      code: 400,
      data: {
        message: `An error has occurred trying to create the delivery:
          ${JSON.stringify(e, null, 2)}`,
      },
    };
  }
};

const findOne = async (req) => {
  let delivery = await Deliveries.findOne({ _id: req.body.id });
  if (!delivery) {
    throw {
      code: 404,
      data: {
        message: `We couldn't find a delivery with the sent ID`,
      },
    };
  }
  return delivery;
};

export default {
  find,
  create,
  findOne,
};
