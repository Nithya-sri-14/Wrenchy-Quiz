const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

// Default initial question pool (63 high-quality questions for extreme replayability)
const defaultQuestions = [
  // ==========================================
  // TECHNICAL - FULLSTACK
  // ==========================================
  // Easy
  {
    id: 1,
    category: "technical",
    subtopic: "fullstack",
    difficulty: "easy",
    question: "What does 'REST' stand for in web services?",
    options: ["Representational State Transfer", "Resource State Transfer", "Realtime State Transition", "Reset State Transmission"],
    correctAnswer: "Representational State Transfer"
  },
  {
    id: 2,
    category: "technical",
    subtopic: "fullstack",
    difficulty: "easy",
    question: "Which database model structures data as tables with rows and columns?",
    options: ["Document Model", "Relational Model", "Key-Value Model", "Graph Model"],
    correctAnswer: "Relational Model"
  },
  {
    id: 3,
    category: "technical",
    subtopic: "fullstack",
    difficulty: "easy",
    question: "In fullstack development, which component serves the visual user interface?",
    options: ["Backend", "Database", "Frontend", "Middleware"],
    correctAnswer: "Frontend"
  },
  {
    id: 4,
    category: "technical",
    subtopic: "fullstack",
    difficulty: "easy",
    question: "Which status code represents a successful HTTP request?",
    options: ["200 OK", "404 Not Found", "500 Internal Server Error", "302 Found"],
    correctAnswer: "200 OK"
  },
  {
    id: 5,
    category: "technical",
    subtopic: "fullstack",
    difficulty: "easy",
    question: "Which language is used to style web page elements?",
    options: ["HTML", "SQL", "CSS", "Python"],
    correctAnswer: "CSS"
  },
  // Medium
  {
    id: 6,
    category: "technical",
    subtopic: "fullstack",
    difficulty: "medium",
    question: "What is the main purpose of CORS in web applications?",
    options: [
      "To compress network packets",
      "To allow or restrict cross-origin resource requests",
      "To compile JavaScript code on the server",
      "To encrypt database passwords"
    ],
    correctAnswer: "To allow or restrict cross-origin resource requests"
  },
  {
    id: 7,
    category: "technical",
    subtopic: "fullstack",
    difficulty: "medium",
    question: "Which of the following is a backend runtime environment for executing JavaScript outside a browser?",
    options: ["Angular", "React", "Node.js", "Docker"],
    correctAnswer: "Node.js"
  },
  {
    id: 8,
    category: "technical",
    subtopic: "fullstack",
    difficulty: "medium",
    question: "In database design, what does a 'foreign key' represent?",
    options: [
      "A primary key from another table referencing a relationship",
      "An encrypted security key",
      "A temporary key used for caching",
      "A key imported from an external database"
    ],
    correctAnswer: "A primary key from another table referencing a relationship"
  },
  {
    id: 9,
    category: "technical",
    subtopic: "fullstack",
    difficulty: "medium",
    question: "Which architectural pattern separates an application into Model, View, and Controller?",
    options: ["Microservices", "Serverless", "MVC", "Event-Driven"],
    correctAnswer: "MVC"
  },
  {
    id: 10,
    category: "technical",
    subtopic: "fullstack",
    difficulty: "medium",
    question: "What does SQL stand for?",
    options: ["Structured Query Language", "Simple Query Language", "Sequential Queue Language", "System Query Link"],
    correctAnswer: "Structured Query Language"
  },
  // Hard
  {
    id: 11,
    category: "technical",
    subtopic: "fullstack",
    difficulty: "hard",
    question: "What is a primary drawback of using JWTs (JSON Web Tokens) for session storage?",
    options: [
      "JWTs are slow to parse",
      "Difficulty in immediate token revocation",
      "JWTs cannot be stored in cookies",
      "JWTs do not support signature validation"
    ],
    correctAnswer: "Difficulty in immediate token revocation"
  },
  {
    id: 12,
    category: "technical",
    subtopic: "fullstack",
    difficulty: "hard",
    question: "In database scaling, what is 'sharding'?",
    options: [
      "Horizontal partitioning of databases across multiple servers",
      "Vertical partitioning of table columns",
      "Caching query results in memory",
      "Creating read-only replica instances"
    ],
    correctAnswer: "Horizontal partitioning of databases across multiple servers"
  },
  {
    id: 13,
    category: "technical",
    subtopic: "fullstack",
    difficulty: "hard",
    question: "Which system design strategy uses a reverse proxy to distribute incoming network traffic across multiple servers?",
    options: ["Database Indexing", "Load Balancing", "API Gateway Routing", "CDN Edge Caching"],
    correctAnswer: "Load Balancing"
  },
  {
    id: 14,
    category: "technical",
    subtopic: "fullstack",
    difficulty: "hard",
    question: "What is the primary purpose of a database transaction's rollback operation?",
    options: [
      "Saving modifications permanently to the disk",
      "Undoing modifications made during an uncommitted transaction",
      "Creating a complete database backup",
      "Optimizing table indices"
    ],
    correctAnswer: "Undoing modifications made during an uncommitted transaction"
  },
  {
    id: 15,
    category: "technical",
    subtopic: "fullstack",
    difficulty: "hard",
    question: "In RESTful API design, which HTTP method is typically used to update an existing resource completely?",
    options: ["PATCH", "POST", "PUT", "GET"],
    correctAnswer: "PUT"
  },

  // ==========================================
  // TECHNICAL - PYTHON
  // ==========================================
  // Easy
  {
    id: 16,
    category: "technical",
    subtopic: "python",
    difficulty: "easy",
    question: "Which keyword is used to define a function in Python?",
    options: ["function", "def", "func", "define"],
    correctAnswer: "def"
  },
  {
    id: 17,
    category: "technical",
    subtopic: "python",
    difficulty: "easy",
    question: "What is the correct file extension for Python scripts?",
    options: [".pyt", ".py", ".pyw", ".python"],
    correctAnswer: ".py"
  },
  {
    id: 18,
    category: "technical",
    subtopic: "python",
    difficulty: "easy",
    question: "Which built-in function returns the number of items in a list?",
    options: ["count()", "size()", "len()", "length()"],
    correctAnswer: "len()"
  },
  {
    id: 19,
    category: "technical",
    subtopic: "python",
    difficulty: "easy",
    question: "Which collection type in Python is ordered, mutable, and allows duplicate elements?",
    options: ["Set", "Tuple", "Dictionary", "List"],
    correctAnswer: "List"
  },
  {
    id: 20,
    category: "technical",
    subtopic: "python",
    difficulty: "easy",
    question: "How do you start a single-line comment in Python?",
    options: ["//", "/*", "#", "--"],
    correctAnswer: "#"
  },
  // Medium
  {
    id: 21,
    category: "technical",
    subtopic: "python",
    difficulty: "medium",
    question: "What does the '__init__' method do in Python classes?",
    options: [
      "Acts as a constructor to initialize object state",
      "Destroys an instance once out of scope",
      "Formats classes into JSON strings",
      "Imports local modules into the namespace"
    ],
    correctAnswer: "Acts as a constructor to initialize object state"
  },
  {
    id: 22,
    category: "technical",
    subtopic: "python",
    difficulty: "medium",
    question: "In Python, what is a generator?",
    options: [
      "A class that inherits from multiple parent classes",
      "A function that returns an iterator using the 'yield' keyword",
      "A script that auto-generates documentation",
      "A thread pool managers"
    ],
    correctAnswer: "A function that returns an iterator using the 'yield' keyword"
  },
  {
    id: 23,
    category: "technical",
    subtopic: "python",
    difficulty: "medium",
    question: "What is the purpose of Python decorators?",
    options: [
      "To format Python code structure",
      "To modify or extend the behavior of a function or method",
      "To package projects for distribution",
      "To profile execution time"
    ],
    correctAnswer: "To modify or extend the behavior of a function or method"
  },
  {
    id: 24,
    category: "technical",
    subtopic: "python",
    difficulty: "medium",
    question: "How does Python's Garbage Collector manage memory?",
    options: [
      "Manual pointer deallocation",
      "Reference counting and generational cyclic detection",
      "Mark-and-sweep only",
      "Static compile-time memory layout"
    ],
    correctAnswer: "Reference counting and generational cyclic detection"
  },
  {
    id: 25,
    category: "technical",
    subtopic: "python",
    difficulty: "medium",
    question: "Which method is used to add an item to the end of a list in Python?",
    options: ["add()", "push()", "append()", "insert()"],
    correctAnswer: "append()"
  },
  // Hard
  {
    id: 26,
    category: "technical",
    subtopic: "python",
    difficulty: "hard",
    question: "What is the GIL (Global Interpreter Lock) in CPython?",
    options: [
      "A lock that prevents third-party packages from being installed",
      "A mutex that prevents multiple native threads from executing Python bytecodes at once",
      "A security sandbox restricting filesystem access",
      "An optimization that speeds up mathematical calculations"
    ],
    correctAnswer: "A mutex that prevents multiple native threads from executing Python bytecodes at once"
  },
  {
    id: 27,
    category: "technical",
    subtopic: "python",
    difficulty: "hard",
    question: "In Python, what is a metaclass?",
    options: [
      "A class that inherits from nothing",
      "A class whose instances are classes themselves",
      "A class that has only class methods",
      "A class defined inside another class"
    ],
    correctAnswer: "A class whose instances are classes themselves"
  },
  {
    id: 28,
    category: "technical",
    subtopic: "python",
    difficulty: "hard",
    question: "What does the 'with' statement utilize under the hood in Python?",
    options: [
      "Context Management protocol with __enter__ and __exit__",
      "Decorator modifications",
      "Generators yield sequences",
      "File descriptor pointers"
    ],
    correctAnswer: "Context Management protocol with __enter__ and __exit__"
  },
  {
    id: 29,
    category: "technical",
    subtopic: "python",
    difficulty: "hard",
    question: "Which built-in module in Python is typically used to handle lightweight concurrency via coroutines?",
    options: ["threading", "multiprocessing", "asyncio", "socket"],
    correctAnswer: "asyncio"
  },
  {
    id: 30,
    category: "technical",
    subtopic: "python",
    difficulty: "hard",
    question: "What does the '*args' parameter in a function definition signify?",
    options: [
      "It marks the function as private",
      "It allows the function to accept any number of positional arguments",
      "It creates a default keyword argument dictionary",
      "It enforces strict type checking"
    ],
    correctAnswer: "It allows the function to accept any number of positional arguments"
  },

  // ==========================================
  // TECHNICAL - JAVASCRIPT
  // ==========================================
  // Easy
  {
    id: 31,
    category: "technical",
    subtopic: "javascript",
    difficulty: "easy",
    question: "Which keyword is used to declare a block-scoped local variable in JavaScript?",
    options: ["var", "let", "const-scoped", "def"],
    correctAnswer: "let"
  },
  {
    id: 32,
    category: "technical",
    subtopic: "javascript",
    difficulty: "easy",
    question: "What is the correct syntax for checking strict equality?",
    options: ["==", "=", "===", "!="],
    correctAnswer: "==="
  },
  {
    id: 33,
    category: "technical",
    subtopic: "javascript",
    difficulty: "easy",
    question: "Which method is used to add one or more elements to the end of an array?",
    options: ["pop()", "push()", "shift()", "unshift()"],
    correctAnswer: "push()"
  },
  {
    id: 34,
    category: "technical",
    subtopic: "javascript",
    difficulty: "easy",
    question: "Which HTML element is used to link a JavaScript file?",
    options: ["<link>", "<script>", "<js>", "<style>"],
    correctAnswer: "<script>"
  },
  {
    id: 35,
    category: "technical",
    subtopic: "javascript",
    difficulty: "easy",
    question: "Which built-in method displays an alert box with a message in the browser?",
    options: ["alert()", "msg()", "print()", "console.log()"],
    correctAnswer: "alert()"
  },
  // Medium
  {
    id: 36,
    category: "technical",
    subtopic: "javascript",
    difficulty: "medium",
    question: "What is a closure in JavaScript?",
    options: [
      "A function that retains access to its lexical scope even when executed outside that scope",
      "A method to close active database connections",
      "A syntax syntax format using curly brackets",
      "A compile-time error checking protocol"
    ],
    correctAnswer: "A function that retains access to its lexical scope even when executed outside that scope"
  },
  {
    id: 37,
    category: "technical",
    subtopic: "javascript",
    difficulty: "medium",
    question: "In JavaScript, what is the 'event loop'?",
    options: [
      "A loop that repeats a block of code a set number of times",
      "A mechanism that handles asynchronous callbacks by pushing them to the call stack",
      "A design pattern used for custom event triggers",
      "A CPU-intensive calculation manager"
    ],
    correctAnswer: "A mechanism that handles asynchronous callbacks by pushing them to the call stack"
  },
  {
    id: 38,
    category: "technical",
    subtopic: "javascript",
    difficulty: "medium",
    question: "What does a JavaScript Promise in a 'pending' state mean?",
    options: [
      "The operation completed successfully",
      "The operation has not completed yet and is active",
      "The operation failed with an error",
      "The operation was cancelled"
    ],
    correctAnswer: "The operation has not completed yet and is active"
  },
  {
    id: 39,
    category: "technical",
    subtopic: "javascript",
    difficulty: "medium",
    question: "Which method creates a new array with all elements that pass a test implemented by a provided function?",
    options: ["map()", "filter()", "reduce()", "forEach()"],
    correctAnswer: "filter()"
  },
  {
    id: 40,
    category: "technical",
    subtopic: "javascript",
    difficulty: "medium",
    question: "What is the purpose of the 'map()' array method?",
    options: [
      "To sort elements in ascending order",
      "To create a new array by applying a function to every element of the calling array",
      "To find the sum of all elements",
      "To check if any element meets a criteria"
    ],
    correctAnswer: "To create a new array by applying a function to every element of the calling array"
  },
  // Hard
  {
    id: 41,
    category: "technical",
    subtopic: "javascript",
    difficulty: "hard",
    question: "How does prototypal inheritance work in JavaScript?",
    options: [
      "Objects inherit properties directly from other prototype objects via a chain link",
      "Classes copy properties during compilation",
      "Functions pass scopes via arguments",
      "Variables are hoisting globally"
    ],
    correctAnswer: "Objects inherit properties directly from other prototype objects via a chain link"
  },
  {
    id: 42,
    category: "technical",
    subtopic: "javascript",
    difficulty: "hard",
    question: "What is the purpose of the 'use strict' directive in JavaScript?",
    options: [
      "To speed up execution of animations",
      "To enforce stricter parsing and error handling at runtime",
      "To allow the use of experimental ES Next features",
      "To prevent global variable declarations completely"
    ],
    correctAnswer: "To enforce stricter parsing and error handling at runtime"
  },
  {
    id: 43,
    category: "technical",
    subtopic: "javascript",
    difficulty: "hard",
    question: "In JavaScript, what is 'hoisting'?",
    options: [
      "The process where declarations are moved to the top of their scope before code execution",
      "Moving asynchronous calls to a background thread",
      "Uploading files via AJAX scripts",
      "Constructing prototypes dynamic properties"
    ],
    correctAnswer: "The process where declarations are moved to the top of their scope before code execution"
  },
  {
    id: 44,
    category: "technical",
    subtopic: "javascript",
    difficulty: "hard",
    question: "What is the difference between 'null' and 'undefined' in JavaScript?",
    options: [
      "They are identical in both value and type",
      "null represents intentional absence of value, while undefined represents uninitialized value",
      "undefined represents intentional absence of value, while null represents uninitialized value",
      "null is an object type while undefined is a boolean type"
    ],
    correctAnswer: "null represents intentional absence of value, while undefined represents uninitialized value"
  },
  {
    id: 45,
    category: "technical",
    subtopic: "javascript",
    difficulty: "hard",
    question: "Which of the following is true about JavaScript arrow functions?",
    options: [
      "They have their own prototype bindings",
      "They do not have their own 'this' binding",
      "They can be used as constructors with the 'new' keyword",
      "They always return undefined"
    ],
    correctAnswer: "They do not have their own 'this' binding"
  },

  // ==========================================
  // SCIENCE
  // ==========================================
  // Easy
  {
    id: 46,
    category: "science",
    difficulty: "easy",
    question: "What is the chemical symbol for water?",
    options: ["O2", "H2O", "CO2", "H2"],
    correctAnswer: "H2O"
  },
  {
    id: 47,
    category: "science",
    difficulty: "easy",
    question: "Which planet in our solar system is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: "Mars"
  },
  {
    id: 48,
    category: "science",
    difficulty: "easy",
    question: "What is the force that pulls objects toward the center of the Earth?",
    options: ["Magnetism", "Centrifugal Force", "Friction", "Gravity"],
    correctAnswer: "Gravity"
  },
  // Medium
  {
    id: 49,
    category: "science",
    difficulty: "medium",
    question: "Approximately how long does it take for light from the Sun to reach Earth?",
    options: ["8 seconds", "8 minutes", "8 hours", "8 days"],
    correctAnswer: "8 minutes"
  },
  {
    id: 50,
    category: "science",
    difficulty: "medium",
    question: "What gas do plants absorb from the atmosphere during photosynthesis?",
    options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
    correctAnswer: "Carbon Dioxide"
  },
  {
    id: 51,
    category: "science",
    difficulty: "medium",
    question: "What is the hardest natural substance known on Earth?",
    options: ["Gold", "Iron", "Diamond", "Quartz"],
    correctAnswer: "Diamond"
  },
  // Hard
  {
    id: 52,
    category: "science",
    difficulty: "hard",
    question: "What is the name of the process by which a cell divides into two identical daughter cells?",
    options: ["Mitosis", "Meiosis", "Osmosis", "Photosynthesis"],
    correctAnswer: "Mitosis"
  },
  {
    id: 53,
    category: "science",
    difficulty: "hard",
    question: "Which subatomic particle has a negative electric charge?",
    options: ["Proton", "Neutron", "Electron", "Quark"],
    correctAnswer: "Electron"
  },
  {
    id: 54,
    category: "science",
    difficulty: "hard",
    question: "What is absolute zero, the theoretical temperature at which all molecular motion stops, in Celsius?",
    options: ["0 °C", "-100 °C", "-273.15 °C", "-459.67 °C"],
    correctAnswer: "-273.15 °C"
  },

  // ==========================================
  // GEOGRAPHY
  // ==========================================
  // Easy
  {
    id: 55,
    category: "geography",
    difficulty: "easy",
    question: "Which is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Southern Ocean", "Pacific Ocean"],
    correctAnswer: "Pacific Ocean"
  },
  {
    id: 56,
    category: "geography",
    difficulty: "easy",
    question: "Which country is home to the famous Eiffel Tower?",
    options: ["United Kingdom", "France", "Italy", "Germany"],
    correctAnswer: "France"
  },
  {
    id: 57,
    category: "geography",
    difficulty: "easy",
    question: "What is the capital city of Japan?",
    options: ["Beijing", "Seoul", "Tokyo", "Bangkok"],
    correctAnswer: "Tokyo"
  },
  // Medium
  {
    id: 58,
    category: "geography",
    difficulty: "medium",
    question: "Which is the longest river in the world?",
    options: ["Amazon River", "Nile River", "Yangtze River", "Mississippi River"],
    correctAnswer: "Nile River"
  },
  {
    id: 59,
    category: "geography",
    difficulty: "medium",
    question: "Which mountain is the highest peak in the world?",
    options: ["K2", "Mount Kilimanjaro", "Mount Everest", "Mount Fuji"],
    correctAnswer: "Mount Everest"
  },
  {
    id: 60,
    category: "geography",
    difficulty: "medium",
    question: "Which desert is the largest hot desert in the world?",
    options: ["Gobi Desert", "Kalahari Desert", "Sahara Desert", "Arabian Desert"],
    correctAnswer: "Sahara Desert"
  },
  // Hard
  {
    id: 61,
    category: "geography",
    difficulty: "hard",
    question: "What is the capital city of Australia?",
    options: ["Sydney", "Melbourne", "Brisbane", "Canberra"],
    correctAnswer: "Canberra"
  },
  {
    id: 62,
    category: "geography",
    difficulty: "hard",
    question: "Which body of water separates the United Kingdom from mainland Europe?",
    options: ["English Channel", "North Sea", "Baltic Sea", "Mediterranean Sea"],
    correctAnswer: "English Channel"
  },
  {
    id: 63,
    category: "geography",
    difficulty: "hard",
    question: "Which country has the most natural lakes in the world, containing over 60% of the global total?",
    options: ["United States", "Russia", "Canada", "Brazil"],
    correctAnswer: "Canada"
  },
  // ==========================================
  // TECHNICAL - DATABASES
  // ==========================================
  {
    id: 64,
    category: "technical",
    subtopic: "databases",
    difficulty: "easy",
    question: "Which SQL statement is used to extract data from a database?",
    options: ["SELECT", "EXTRACT", "GET", "OPEN"],
    correctAnswer: "SELECT"
  },
  {
    id: 65,
    category: "technical",
    subtopic: "databases",
    difficulty: "easy",
    question: "Which constraint uniquely identifies each record in a database table?",
    options: ["FOREIGN KEY", "UNIQUE", "PRIMARY KEY", "NOT NULL"],
    correctAnswer: "PRIMARY KEY"
  },
  {
    id: 66,
    category: "technical",
    subtopic: "databases",
    difficulty: "medium",
    question: "What does the ACID acronym stand for in database transactions?",
    options: [
      "Atomicity, Consistency, Isolation, Durability",
      "Access, Control, Indexing, Distribution",
      "Analysis, Concurrency, Integration, Design",
      "Atomicity, Concurrency, Isolation, Dependency"
    ],
    correctAnswer: "Atomicity, Consistency, Isolation, Durability"
  },
  {
    id: 67,
    category: "technical",
    subtopic: "databases",
    difficulty: "medium",
    question: "Which type of join returns all rows from the left table, and matching rows from the right table?",
    options: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL JOIN"],
    correctAnswer: "LEFT JOIN"
  },
  {
    id: 68,
    category: "technical",
    subtopic: "databases",
    difficulty: "hard",
    question: "What is the main purpose of Database Normalization?",
    options: [
      "To encrypt database keys",
      "To reduce data redundancy and improve data integrity",
      "To speed up data reads at the cost of writes",
      "To automatically generate backup copies"
    ],
    correctAnswer: "To reduce data redundancy and improve data integrity"
  },
  {
    id: 69,
    category: "technical",
    subtopic: "databases",
    difficulty: "hard",
    question: "What is a database index primarily used for?",
    options: [
      "To enforce data type constraints",
      "To speed up data retrieval operations",
      "To secure the database from SQL injection",
      "To partition tables across servers"
    ],
    correctAnswer: "To speed up data retrieval operations"
  },
  // ==========================================
  // TECHNICAL - DEVOPS
  // ==========================================
  {
    id: 70,
    category: "technical",
    subtopic: "devops",
    difficulty: "easy",
    question: "What does CI/CD stand for in modern software engineering?",
    options: [
      "Continuous Integration / Continuous Deployment",
      "Code Integration / Code Delivery",
      "Cloud Integration / Cloud Distribution",
      "Constant Improvement / Constant Development"
    ],
    correctAnswer: "Continuous Integration / Continuous Deployment"
  },
  {
    id: 71,
    category: "technical",
    subtopic: "devops",
    difficulty: "easy",
    question: "Which tool is widely used to containerize applications?",
    options: ["Kubernetes", "Docker", "Jenkins", "Git"],
    correctAnswer: "Docker"
  },
  {
    id: 72,
    category: "technical",
    subtopic: "devops",
    difficulty: "medium",
    question: "What is the primary role of Kubernetes?",
    options: [
      "To write application code",
      "To containerize monolithic applications",
      "To automate container deployment scaling and management",
      "To monitor database query speed"
    ],
    correctAnswer: "To automate container deployment scaling and management"
  },
  {
    id: 73,
    category: "technical",
    subtopic: "devops",
    difficulty: "medium",
    question: "What is Infrastructure as Code (IaC)?",
    options: [
      "Writing code in HTML",
      "Managing and provisioning infrastructure through machine-readable definition files",
      "Virtualizing server components in hardware",
      "Compiling operating system kernels automatically"
    ],
    correctAnswer: "Managing and provisioning infrastructure through machine-readable definition files"
  },
  {
    id: 74,
    category: "technical",
    subtopic: "devops",
    difficulty: "hard",
    question: "What is the main difference between blue-green deployment and canary deployment?",
    options: [
      "Blue-green deploys to a small subset of users first; Blue-green requires zero environment duplication",
      "Blue-green maintains two identical production environments while Canary rolls out changes to a small subset of users incrementally",
      "Canary requires switching entire routing DNS instantly",
      "Blue-green operates on hardware layers while Canary operates on application layers"
    ],
    correctAnswer: "Blue-green maintains two identical production environments while Canary rolls out changes to a small subset of users incrementally"
  },
  {
    id: 75,
    category: "technical",
    subtopic: "devops",
    difficulty: "hard",
    question: "In AWS, what does S3 stand for?",
    options: ["Simple Storage Service", "Secure Socket System", "Serverless Shared Storage", "System Security Suite"],
    correctAnswer: "Simple Storage Service"
  },
  // ==========================================
  // TECHNICAL - SECURITY
  // ==========================================
  {
    id: 76,
    category: "technical",
    subtopic: "security",
    difficulty: "easy",
    question: "What is HTTPS used for?",
    options: [
      "To download files faster",
      "To encrypt communication between the browser and the web server",
      "To compile styles on the client side",
      "To validate email addresses on forms"
    ],
    correctAnswer: "To encrypt communication between the browser and the web server"
  },
  {
    id: 77,
    category: "technical",
    subtopic: "security",
    difficulty: "easy",
    question: "Which term describes a malicious attempt to obtain sensitive information by masquerading as a trustworthy entity in an email?",
    options: ["Phishing", "DDOS", "SQL Injection", "Buffer Overflow"],
    correctAnswer: "Phishing"
  },
  {
    id: 78,
    category: "technical",
    subtopic: "security",
    difficulty: "medium",
    question: "What is SQL Injection?",
    options: [
      "A method of inserting database indexes",
      "A technique where malicious SQL statements are inserted into entry fields for execution",
      "A performance optimization for databases",
      "A way to backup database tables using queries"
    ],
    correctAnswer: "A technique where malicious SQL statements are inserted into entry fields for execution"
  },
  {
    id: 79,
    category: "technical",
    subtopic: "security",
    difficulty: "medium",
    question: "What is the primary purpose of a firewall?",
    options: [
      "To compile code faster",
      "To monitor and filter incoming and outgoing network traffic",
      "To encrypt user passwords on disk",
      "To manage container deployments"
    ],
    correctAnswer: "To monitor and filter incoming and outgoing network traffic"
  },
  {
    id: 80,
    category: "technical",
    subtopic: "security",
    difficulty: "hard",
    question: "What is Cross-Site Scripting (XSS)?",
    options: [
      "A vulnerability where malicious scripts are injected into benign and trusted websites",
      "A database indexing error",
      "A cross-origin request block by CORS",
      "A method to style components using inline JavaScript"
    ],
    correctAnswer: "A vulnerability where malicious scripts are injected into benign and trusted websites"
  },
  {
    id: 81,
    category: "technical",
    subtopic: "security",
    difficulty: "hard",
    question: "What does the 'Symmetric' in Symmetric Encryption mean?",
    options: [
      "Encryption and decryption use different keys",
      "Encryption and decryption use the same key",
      "The key length matches the data length",
      "The encryption algorithm runs on both client and server"
    ],
    correctAnswer: "Encryption and decryption use the same key"
  }
];

// Read from JSON db or write defaults
function initDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initialData = {
        questions: defaultQuestions,
        leaderboard: [
          { name: "Satoshi", score: 100 },
          { name: "Marie", score: 90 },
          { name: "Columbus", score: 80 }
        ],
        users: []
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf8');
      console.log('Database initialized and seeded successfully.');
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// Load current data from db
function loadDB() {
  try {
    initDB();
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const parsed = JSON.parse(data);
    let modified = false;
    if (!parsed.users) {
      parsed.users = [];
      modified = true;
    }
    if (!parsed.votes) {
      parsed.votes = [];
      modified = true;
    }
    if (modified) {
      saveDB(parsed);
    }
    return parsed;
  } catch (error) {
    console.error('Failed to load database:', error);
    return { questions: defaultQuestions, leaderboard: [], users: [], votes: [] };
  }
}

// Save data to db atomically
function saveDB(data) {
  try {
    const tempPath = `${DB_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, DB_PATH);
    return true;
  } catch (error) {
    console.error('Failed to save database:', error);
    return false;
  }
}

module.exports = {
  getQuestions: (category, difficulty, subtopic) => {
    const db = loadDB();
    let result = db.questions;
    if (category) {
      result = result.filter(q => q.category.toLowerCase() === category.toLowerCase());
    }
    if (subtopic) {
      result = result.filter(q => q.subtopic && q.subtopic.toLowerCase() === subtopic.toLowerCase());
    }
    if (difficulty) {
      result = result.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
    }
    return result;
  },

  getCategories: () => {
    const db = loadDB();
    const categoriesSet = new Set(db.questions.map(q => q.category));
    return Array.from(categoriesSet).map(cat => {
      const cleanCat = cat.toLowerCase().trim();
      let name = cat.charAt(0).toUpperCase() + cat.slice(1);
      
      if (cleanCat === "technical") { name = "Technical"; }
      else if (cleanCat === "science") { name = "Science"; }
      else if (cleanCat === "geography") { name = "Geography"; }
      
      return { id: cat, name };
    });
  },

  getSubtopics: (category) => {
    const db = loadDB();
    const subtopicsSet = new Set(
      db.questions
        .filter(q => q.category.toLowerCase() === category.toLowerCase() && q.subtopic)
        .map(q => q.subtopic)
    );
    return Array.from(subtopicsSet).map(sub => {
      const cleanSub = sub.toLowerCase().trim();
      let name = sub.charAt(0).toUpperCase() + sub.slice(1);
      if (cleanSub === "fullstack") name = "Fullstack";
      else if (cleanSub === "python") name = "Python";
      else if (cleanSub === "javascript" || cleanSub === "js") name = "JavaScript";
      else if (cleanSub === "databases") name = "Databases & SQL";
      else if (cleanSub === "devops") name = "DevOps & Cloud";
      else if (cleanSub === "security") name = "Cybersecurity";
      return { id: sub, name };
    });
  },

  getLeaderboard: () => {
    const db = loadDB();
    // Sort scores: Highest score first
    return db.leaderboard.sort((a, b) => b.score - a.score).slice(0, 10); // Return top 10
  },

  saveLeaderboardScore: (scoreEntry) => {
    const db = loadDB();
    const newEntry = {
      name: scoreEntry.name || "Anonymous",
      score: parseInt(scoreEntry.score) || 0
    };
    db.leaderboard.push(newEntry);
    saveDB(db);
    return newEntry;
  },

  findUserByEmail: (email) => {
    const db = loadDB();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  registerNewUser: (userEntry) => {
    const db = loadDB();
    const newEntry = {
      username: userEntry.username.trim(),
      email: userEntry.email.toLowerCase().trim(),
      password: userEntry.password,
      streak: 1,
      lastLoginAt: new Date().toISOString(),
      achievements: [],
      answeredQuestions: [],
      avatarEmoji: '⚡'
    };
    db.users.push(newEntry);
    saveDB(db);
    return newEntry;
  },

  updateStreak: (email) => {
    const db = loadDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;

    const now = new Date();
    // Default values if streak/lastLoginAt are not present
    if (user.streak === undefined || user.streak === null) {
      user.streak = 1;
    }
    if (!user.lastLoginAt) {
      user.lastLoginAt = now.toISOString();
      saveDB(db);
      return user;
    }

    const lastLogin = new Date(user.lastLoginAt);
    
    // Calculate the difference in calendar days.
    const lastLoginDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = currentDate - lastLoginDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day login! Increment streak
      user.streak += 1;
      user.lastLoginAt = now.toISOString();
      saveDB(db);
    } else if (diffDays > 1) {
      // Broken streak! Reset streak to 1
      user.streak = 1;
      user.lastLoginAt = now.toISOString();
      saveDB(db);
    } else if (diffDays === 0) {
      // Same day login. Keep streak but update timestamp
      user.lastLoginAt = now.toISOString();
      saveDB(db);
    }
    
    return user;
  },

  getUserAchievements: (email) => {
    const db = loadDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user ? (user.achievements || []) : [];
  },

  saveUserAchievement: (email, achievementId) => {
    const db = loadDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      if (!user.achievements) {
        user.achievements = [];
      }
      if (!user.achievements.includes(achievementId)) {
        user.achievements.push(achievementId);
        saveDB(db);
        return { success: true, achievements: user.achievements };
      }
      return { success: true, achievements: user.achievements, alreadyUnlocked: true };
    }
    return { success: false, error: 'User not found' };
  },

  getTopicVotes: (category, subtopic) => {
    const db = loadDB();
    if (!db.votes) {
      db.votes = [];
    }
    const relevantVotes = db.votes.filter(v => 
      v.category.toLowerCase() === category.toLowerCase() && 
      (v.subtopic || '').toLowerCase() === (subtopic || '').toLowerCase()
    );
    
    let easy = 0, medium = 0, hard = 0;
    relevantVotes.forEach(v => {
      const voteVal = v.vote.toLowerCase();
      if (voteVal === 'easy') easy++;
      else if (voteVal === 'medium') medium++;
      else if (voteVal === 'hard') hard++;
    });
    const total = easy + medium + hard;
    
    return {
      category,
      subtopic,
      total,
      percentages: {
        easy: total > 0 ? Math.round((easy / total) * 100) : 33,
        medium: total > 0 ? Math.round((medium / total) * 100) : 33,
        hard: total > 0 ? Math.round((hard / total) * 100) : 34
      }
    };
  },

  saveTopicVote: (category, subtopic, vote) => {
    const db = loadDB();
    if (!db.votes) {
      db.votes = [];
    }
    db.votes.push({
      category: category.toLowerCase(),
      subtopic: (subtopic || '').toLowerCase(),
      vote: vote.toLowerCase(),
      votedAt: new Date().toISOString()
    });
    saveDB(db);
    return true;
  },

  getRecentGames: (email) => {
    const data = loadDB();
    if (!data.recentGames) data.recentGames = {};
    return data.recentGames[email] || [];
  },

  saveRecentGame: (email, game) => {
    const data = loadDB();
    if (!data.recentGames) data.recentGames = {};
    if (!data.recentGames[email]) data.recentGames[email] = [];
    data.recentGames[email].unshift(game);
    data.recentGames[email] = data.recentGames[email].slice(0, 10); // Keep last 10
    saveDB(data);
    return game;
  },

  saveUserAnsweredQuestions: (email, answeredQuestions) => {
    const db = loadDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      user.answeredQuestions = answeredQuestions;
      saveDB(db);
      return true;
    }
    return false;
  },

  saveUserAchievements: (email, achievements) => {
    const db = loadDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      user.achievements = achievements;
      saveDB(db);
      return true;
    }
    return false;
  },

  getAllQuestions: () => {
    const db = loadDB();
    return db.questions || [];
  },

  updateUserProfile: (email, details) => {
    const db = loadDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;

    if (details.username) user.username = details.username.trim();
    if (details.newEmail) user.email = details.newEmail.toLowerCase().trim();
    if (details.password) user.password = details.password;
    if (details.avatarEmoji) user.avatarEmoji = details.avatarEmoji;
    if (details.avatarImage !== undefined) user.avatarImage = details.avatarImage;

    saveDB(db);
    return user;
  }
};
