const Select = ({ value, onChange, children }) => {
    return (
        <select
            value={value}
            onChange={onChange}
            className="border border-gray-300 rounded-md px-3 py-2"
        >
            {children}
        </select>
    );
};

const SelectItem = ({ value, children }) => {
    return <option value={value}>{children}</option>;
};

export { Select, SelectItem }; // ✅ Export ให้ถูกต้อง (ไม่มีซ้ำ)
