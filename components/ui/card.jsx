export function Card({ children }) {
    return <div className="bg-white shadow-md rounded-xl p-4">{children}</div>;
  }
  
  export function CardContent({ children }) {
    return <div className="p-2">{children}</div>;
  }
  