import React from 'react';

export const TextInput = (props) => {
    const { className, placeholder, type, register, error, errorClassName, options } = props;

    if (type === 'select') {
        return (
            <>
                <select className={className} {...register}>
                    <option value="">{placeholder}</option>
                    {options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                {error && <p className={errorClassName}>{error.message}</p>}
            </>
        );
    }

    return (
        <>
            <input
                className={className}
                placeholder={placeholder}
                type={type}
                {...register}
            />
            {error && <p className={errorClassName}>{error.message}</p>}
        </>
    );
};