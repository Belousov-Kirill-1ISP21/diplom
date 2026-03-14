import React from 'react';

export const TextInput = (props) => {
    const {className, placeholder, type, register, error, errorClassName} = props;

    return (<>
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