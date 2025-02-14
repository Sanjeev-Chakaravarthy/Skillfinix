console.log(module);
module.exports = {
    important:true,
    theme: {
      extend: {
        animation: {
          shimmer: "shimmer 2s linear infinite",
        },
        keyframes: {
          shimmer: {
            from: { backgroundPosition: "0 0" },
            to: { backgroundPosition: "-200% 0" },
          },
        },
      },
    },
    plugins: [],
  };
