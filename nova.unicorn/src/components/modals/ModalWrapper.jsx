const ModalWrapper= ({ children }) => {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-90 z-50 flex items-center justify-center">
      <div className="bg-white p-5 rounded-md shadow-lg w-[90%] md:w-[70%] lg:w-[40%] xl:w-[35%]">
        {children}
      </div>
    </div>
  );
};

export default ModalWrapper;
