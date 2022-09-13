const { i18n } = require("./next-i18next.config");

const nextConfig = {
  experimental: {
    outputStandalone: true,
  },
  images: {
    domains: [
      "s4.anilist.co",
      "res.cloudinary.com",
      "lh3.googleusercontent.com",
      "platform-lookaside.fbsbx.com",
      "i.ibb.co",
      "thumb.tapecontent.net",
      "emojis.slackmojis.com",
      "pic-bstarstatic.akamaized.net",
      "cdn.discordapp.com",
    ],
    minimumCacheTTL: 604800, // a week,
  },
  i18n,
};

// ensure that your source maps include changes from all other Webpack plugins
module.exports = nextConfig;
