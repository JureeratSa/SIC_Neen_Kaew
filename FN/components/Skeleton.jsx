const Skeleton = ({ count = 5 }) => {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="h-14 bg-gray-300 rounded-md animate-pulse"></div>
            ))}
        </div>
    );
};

export default Skeleton;
