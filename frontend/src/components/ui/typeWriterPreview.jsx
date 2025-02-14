import Typewriter from "./typeWriter";

const typeWriterPreview = () => {
  const textData = [
    {
      text: "Swap, Share, Succeed Unlock Your Potential with Skill Swap!",
      className: "text-purple-400",
    },
  ];

  return (
    <div className="flex justify-center items-center h-screen bg-[#000000]">
      <Typewriter
        words={textData}
        className="text-white"
        cursorClassName="bg-white"
      />
    </div>
  );
};

export default typeWriterPreview;
