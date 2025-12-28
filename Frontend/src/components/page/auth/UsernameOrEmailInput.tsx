import React from "react";
import FormInput from "./FormInput";

interface UsernameOrEmailInputProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    error?: string;
    required?: boolean;
}

const UsernameOrEmailInput: React.FC<UsernameOrEmailInputProps> = (props) => {
    const icon = (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
    );

    return (
        <FormInput
            {...props}
            type="text"
            icon={icon}
        />
    );
};

export default UsernameOrEmailInput;
