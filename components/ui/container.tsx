interface ContainerProps {
    children: React.ReactNode,
    className?: string;

}

const Container: React.FC<ContainerProps> = ({ children, className }) => {
    const containerClassName = className ? className : "mx-auto w-full max-w-full h-54";

    return (
        <div className= {containerClassName}>{children}</div>

    );
};

export default Container;