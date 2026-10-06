const dataFaq = [
    {
        id: 1,
        question: 'Can you explain the role of Node.js in web development?',
        answer: 'Traditionally, JavaScript was mainly used on the client side (in web browsers) for enhancing user interfaces. With Node.js, developers can use JavaScript on the server side as well. This allows for a more consistent and seamless development experience across both client and server components.',
        analysis:"The given answer explains the role of Node.js in web development accurately. It mentions that JavaScript was traditionally used on the client side, but with Node.js, developers can also use JavaScript on the server side. This allows for a consistent development experience across both client and server components.",
        accuracy_percentage:80,
        improvements:"",
        confidence_level:"High",
        show: 'show'
    },
    {
        id: 2,
        question: 'How does MongoDB differ from traditional SQL databases?',
        answer: 'MongoDB and traditional SQL databases are completely identical in every aspect, and there is absolutely no difference between them. They share the same data model, storage structure, query language, and overall design philosophy. Additionally, both MongoDB and SQL databases have identical performance characteristics, scalability options, and security features. There is no need to consider any distinctions when choosing between them, as they are essentially interchangeable, and you can seamlessly switch from one to the other without any impact on your application.',
        analysis:"The given answer is incorrect. MongoDB and traditional SQL databases have significant differences in various aspects. While both store data, they have different data models, storage structures, and query languages. MongoDB uses a flexible document-based data model, while SQL databases use a rigid, table-based data model. MongoDB uses JSON-like documents with dynamic schemas, while SQL databases use tables with predefined schemas. The query languages, MongoDB's query language is based on document structure and supports rich querying capabilities, while SQL databases use structured query language (SQL) for querying relational data. Additionally, MongoDB is a NoSQL database, which provides horizontal scalability and flexible schema design, while traditional SQL databases are not designed for horizontal scalability and have fixed schemas. Performance characteristics, scalability options, and security features also differ between the two types of databases. It is important to consider these distinctions when choosing between MongoDB and traditional SQL databases for a specific use case.",
        accuracy_percentage:0,
        improvements:"The provided answer should be corrected to reflect the differences between MongoDB and traditional SQL databases. It should mention the different data models, storage structures, and query languages used by the two types of databases. It should also highlight the scalability and schema flexibility advantages of MongoDB over traditional SQL databases. Additionally, it would be beneficial to provide examples or use cases where MongoDB is a better fit than traditional SQL databases.",
        confidence_level:"High",
    },
]

export default dataFaq;