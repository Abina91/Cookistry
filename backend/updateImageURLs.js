const mongoose = require("mongoose");
const Recipe = require("./models/Recipe"); // your recipe model
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

const imageMapping = {
  "Rice Payasam": "https://res.cloudinary.com/dyqi5fl7a/image/upload/v1762580854/cookistry/erzcwagcc4ce2bup7tgm.jpg",
  "Recipe 2": "https://res.cloudinary.com/dyqi5fl7a/image/upload/v1762580854/cookistry/y2es162gyopgoub0y2th.jpg",
  "Recipe 3": "https://res.cloudinary.com/dyqi5fl7a/image/upload/v1762580854/cookistry/wm3jwd2c0rsx6wcmbd37.jpg"
};

(async () => {
  for (const [title, url] of Object.entries(imageMapping)) {
    await Recipe.updateOne({ title }, { $set: { imageURL: url } });
    console.log(`Updated ${title}`);
  }
  mongoose.connection.close();
})();
