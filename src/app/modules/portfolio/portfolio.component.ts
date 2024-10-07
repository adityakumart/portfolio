import { Component, signal } from '@angular/core';

@Component({
    selector: 'app-portfolio',
    templateUrl: './portfolio.component.html',
    styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent {

    resume = signal({
        basics: {
            name: "T Aditya Kumar",
            label: "Web Developer",
            image: "",
            email: "aditya.anil950@gmail.com",
            phone: "9505028181",
            url: "https://adityakumart.github.io/portfolio/",
            summary: [
                "6+ years’ experience in Web-based development.",
                "Having good experience in Angular, JavaScript, and Typescript.",
                "Proficient in HTML5, CSS3, JavaScript, ECMA Script 6 (ES6), jQuery, Bootstrap, Angular, React JS.",
                "Managed multiple projects simultaneously while maintaining strict deadlines.",
                "Collaborated with cross-functional teams to gather business requirements, design UI workflows, and drive continuous improvement efforts through proactive participation.",
                "Conducted thorough research and development of third-party tools, exploring its functionalities and integration methods with internal products.",
                "Designed User-friendly interfaces and Responsive web development. Analyzed, debugged, tracked the bugs and resolved them by providing ",
                "Developed Custom Chrome Extension to embed Curately web app, where clients can work straight from their web app. It allows users to auto-fill Forms.",
                "Hands-on experience in the complete life cycle of Software Engineering – Requirements Analysis, Design, Development and Unit Testing. ",
                "Performed routine updates, upgrades, and overall maintenance of website/application/products.",
                "Building web applications from scratch and adding functionality using modern libraries and technologies.",
                "Experience in using version control systems like Git, GitHub",
                "Actively contributed to product deployment planning, ensuring seamless integration and successful rollout."
            ],
            location: {
                address: "22-3-1/1B",
                postalCode: "533 255",
                city: "Ramachandrapuram",
                countryCode: "India",
                region: "Andhra Pradesh"
            },
            profiles: [{
                network: "Github",
                username: "adityakumart",
                url: "https://github.com/adityakumart"
            }]
        },
        work: [{
            name: "OVA Innovation Labs PVT LTD",
            position: "Senior Software Engineer",
            url: "https://ova.work",
            startDate: "2018-01-02",
            endDate: "2014-01-01",
            summary: "",
            highlights: [""]
        }],
        volunteer: [{
            organization: "Organization",
            position: "Volunteer",
            url: "https://organization.com/",
            startDate: "2012-01-01",
            endDate: "2013-01-01",
            summary: "Description…",
            highlights: [
                "Awarded 'Volunteer of the Month'"
            ]
        }],
        education: [{
            institution: "University",
            url: "https://institution.com/",
            area: "Software Development",
            studyType: "Bachelor",
            startDate: "2011-01-01",
            endDate: "2013-01-01",
            score: "4.0",
            courses: [
                "DB1101 - Basic SQL"
            ]
        }],
        awards: [{
            title: "Award",
            date: "2014-11-01",
            awarder: "Company",
            summary: "There is no spoon."
        }],
        certificates: [{
            name: "Certificate",
            date: "2021-11-07",
            issuer: "Company",
            url: "https://certificate.com"
        }],
        publications: [{
            name: "Publication",
            publisher: "Company",
            releaseDate: "2014-10-01",
            url: "https://publication.com",
            summary: "Description…"
        }],
        skills: [
            {
                name: "Language",
                keywords: ["HTML", "CSS", "JS"]
            },
            {
                name: "Version Control",
                keywords: ["GIT", "Github"]
            },
            {
                name: "JS UI",
                keywords: ["jQuery", "Angular", "React", "Browser Extension"]
            },
            {
                name: "OS",
                keywords: ["Windows", "Linux"]
            },
            {
                name: "Database",
                keywords: ["MySql", "MongoDB"]
            },
            {
                name: "Productivity Suite",
                keywords: ["Word", "Excel", "Powerpoint"]
            },
            {
                name: "Framework",
                keywords: ["Bootstrap"]
            },
            {
                name: "Tools",
                keywords: ["VS Code"]
            }
        ],
        languages: [{
            language: "English",
            fluency: "Native speaker"
        }],
        interests: [{
            name: "Wildlife",
            keywords: [
                "Ferrets",
                "Unicorns"
            ]
        }],
        references: [{
            name: "Jane Doe",
            reference: "Reference…"
        }],
        projects: [{
            name: "Project",
            startDate: "2019-01-01",
            endDate: "2021-01-01",
            summary: "Summary...",
            highlights: [
                "Won award at AIHacks 2016"
            ],
            url: "https://project.com/"
        }]
    })

}
