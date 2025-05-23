const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="flex justify-center mt-4">
            {Array.from({ length: totalPages }, (_, i) => (
                <button
                    key={i}
                    onClick={() => onPageChange(i + 1)}
                    className={`mx-1 px-3 py-1 rounded-md ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"
                        }`}
                >
                    {i + 1}
                </button>
            ))}
        </div>
    );
};

export default Pagination;
