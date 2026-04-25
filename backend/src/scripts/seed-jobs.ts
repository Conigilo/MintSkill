import { db, Collections } from '../services/firebase.service'

const MOCK_JOBS = [
    {
        id: "1",
        title: "Frontend Developer",
        company: "LINE MAN Wongnai",
        location: "Bangkok",
        type: "Full-time",
        salary: "50,000 - 90,000 ฿",
        description: "Build beautiful and performant web UIs for millions of users. Collaborate with product and design teams.",
        requiredSkills: ["React", "TypeScript", "CSS", "JavaScript"],
        preferredSkills: ["Next.js", "TailwindCSS", "GraphQL"],
        logo: "🟢",
    },
    {
        id: "2",
        title: "Backend Engineer (Node.js)",
        company: "Agoda",
        location: "Bangkok",
        type: "Full-time",
        salary: "80,000 - 150,000 ฿",
        description: "Design and maintain scalable microservices serving hundreds of millions of travel customers worldwide.",
        requiredSkills: ["Node.js", "TypeScript", "PostgreSQL", "Docker"],
        preferredSkills: ["Kafka", "Kubernetes", "Redis"],
        logo: "🔵",
    },
    {
        id: "3",
        title: "Full Stack Developer",
        company: "Bitkub",
        location: "Bangkok",
        type: "Full-time",
        salary: "70,000 - 120,000 ฿",
        description: "Work across frontend and backend to build crypto exchange features used by over 3 million users.",
        requiredSkills: ["React", "Node.js", "PostgreSQL", "TypeScript"],
        preferredSkills: ["Web3.js", "Redis", "Docker"],
        logo: "🟡",
    },
    {
        id: "4",
        title: "Python Data Engineer",
        company: "Central Group",
        location: "Bangkok",
        type: "Full-time",
        salary: "60,000 - 100,000 ฿",
        description: "Build ETL pipelines and data platforms that power analytics for Thailand's largest retail group.",
        requiredSkills: ["Python", "SQL", "Apache Spark", "Airflow"],
        preferredSkills: ["BigQuery", "dbt", "Kafka"],
        logo: "🟠",
    },
    {
        id: "5",
        title: "DevOps / Cloud Engineer",
        company: "SCB Tech",
        location: "Bangkok",
        type: "Full-time",
        salary: "90,000 - 160,000 ฿",
        description: "Own the cloud infrastructure and CI/CD pipelines for SCB's digital banking products.",
        requiredSkills: ["AWS", "Docker", "Kubernetes", "Terraform"],
        preferredSkills: ["GitHub Actions", "Datadog", "Python"],
        logo: "🟣",
    },
    {
        id: "6",
        title: "React Native Developer",
        company: "Rabbit Finance",
        location: "Bangkok",
        type: "Full-time",
        salary: "55,000 - 95,000 ฿",
        description: "Develop and maintain cross-platform mobile apps for insurance and finance products.",
        requiredSkills: ["React Native", "JavaScript", "TypeScript", "REST APIs"],
        preferredSkills: ["Expo", "Firebase", "Redux"],
        logo: "🐰",
    },
    {
        id: "7",
        title: "Machine Learning Engineer",
        company: "KBTG (Kasikorn)",
        location: "Bangkok",
        type: "Full-time",
        salary: "100,000 - 180,000 ฿",
        description: "Build and deploy ML models for fraud detection, credit scoring, and customer recommendation.",
        requiredSkills: ["Python", "TensorFlow", "PyTorch", "SQL"],
        preferredSkills: ["MLflow", "Docker", "Kubernetes"],
        logo: "🏦",
    },
    {
        id: "8",
        title: "UI/UX Engineer",
        company: "Wongnai",
        location: "Bangkok",
        type: "Full-time",
        salary: "45,000 - 75,000 ฿",
        description: "Bridge design and engineering — translate Figma designs into pixel-perfect interactive components.",
        requiredSkills: ["React", "CSS", "Figma", "JavaScript"],
        preferredSkills: ["Storybook", "Framer Motion", "TailwindCSS"],
        logo: "🍴",
    },
    {
        id: "9",
        title: "Junior Backend Developer",
        company: "Pomelo Fashion",
        location: "Bangkok / Remote",
        type: "Full-time",
        salary: "30,000 - 55,000 ฿",
        description: "Great opportunity for new grads! Help build e-commerce backend APIs and learn from senior engineers.",
        requiredSkills: ["Node.js", "JavaScript", "REST APIs"],
        preferredSkills: ["TypeScript", "MySQL", "Docker"],
        logo: "👗",
    },
    {
        id: "10",
        title: "Cybersecurity Analyst",
        company: "DTAC (NTPLC)",
        location: "Bangkok",
        type: "Full-time",
        salary: "55,000 - 90,000 ฿",
        description: "Protect network infrastructure and respond to threats for Thailand's leading telecom company.",
        requiredSkills: ["Network Security", "Linux", "Python", "SIEM"],
        preferredSkills: ["CEH", "Splunk", "Wireshark"],
        logo: "🔐",
    },
];

async function seedJobs() {
    const jobsCollection = db.collection(Collections.JOBS);

    // // Clear existing jobs first if you want a clean start
    // const snapshot = await jobsCollection.get();
    // const batch = db.batch();
    // snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    // await batch.commit();
    // console.log('Cleared existing jobs.');

    for (const job of MOCK_JOBS) {
        const { id, ...jobData } = job;
        await jobsCollection.doc(id).set({
            ...jobData,
            postedAt: new Date(),
        });
        console.log(`Seeded job: ${job.title} at ${job.company}`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
}

seedJobs().catch((error) => {
    console.error(' Error seeding jobs:', error);
    process.exit(1);
});
