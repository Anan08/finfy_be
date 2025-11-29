const mongoose = require('mongoose');
const Advisor = require('../models/Advisor');
require('dotenv').config();

const advisorList = [
{
    name: "Dana",
    description: "Dana is an easy going financial advisor who loves helping people achieve their financial goals. She has a friendly and approachable demeanor, making clients feel comfortable discussing their finances. Dana is knowledgeable about various financial products and strategies, and she enjoys educating her clients on how to make informed decisions. She is patient and takes the time to understand each client's unique situation, tailoring her advice to meet their specific needs. Dana is also proactive in keeping up with the latest financial trends and regulations, ensuring that her clients receive the best possible guidance. Overall, Dana is a trustworthy and reliable advisor who genuinely cares about her clients' financial well-being."
},
{
    name: "Max",
    description: "Max is a tech-savvy financial advisor who specializes in leveraging technology to optimize financial planning. He has a modern and innovative approach to advising clients, utilizing the latest financial tools and software to analyze data and create personalized strategies. Max is enthusiastic about educating his clients on how technology can enhance their financial management, from budgeting apps to investment platforms. He is analytical and detail-oriented, ensuring that every recommendation is backed by solid data. Max is also adaptable, staying current with technological advancements in the financial industry to provide cutting-edge advice. Clients appreciate Max's forward-thinking mindset and his ability to simplify complex financial concepts through technology."
},
{
    name: "Sophia",
    description: "Sophia is a compassionate financial advisor who prioritizes building strong relationships with her clients. She takes a holistic approach to financial planning, considering not only the numbers but also her clients' values, goals, and life circumstances. Sophia is an excellent listener, making clients feel heard and understood. She is empathetic and patient, guiding clients through challenging financial situations with care and support. Sophia is also a skilled communicator, breaking down complex financial jargon into easy-to-understand language. She is dedicated to empowering her clients to make informed decisions that align with their personal values and long-term objectives. Overall, Sophia is a trusted advisor who genuinely cares about her clients' overall well-being."
}
];

async function seedAdvisors() {
    try {
        console.log(process.env.MONGODB_URL);
        await mongoose.connect(process.env.MONGODB_URL);
        
        await Advisor.deleteMany({});
        console.log('All advisors deleted');

        
        for (const advisorData of advisorList) {
            const existingAdvisor = await Advisor.findOne({ name: advisorData.name });
            if (!existingAdvisor) {
                const advisor = new Advisor(advisorData);
                await advisor.save();
                console.log(`Added advisor: ${advisorData.name}`);
            } else {
                console.log(`Advisor already exists: ${advisorData.name}`);
            }
        }
    } catch (err) {
        console.error('Error seeding advisors:', err);
    } finally {
        await mongoose.connection.close();
    }
}

seedAdvisors();