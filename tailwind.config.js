module.exports = {
  purge: {
    enabled: true,
    content: ["./*.html", "./js/*.js"],
  },
  theme: {
    extend: {
      animation: {
        "marble-pick": "marblePick 400ms ease-in forwards",
        "marble-drop": "marbleDrop 400ms ease-out forwards",
      },
    },
  },
  variants: {},
  plugins: [],
};
