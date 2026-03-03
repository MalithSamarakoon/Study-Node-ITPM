import React from 'react';

const Footer = () => {
    const footerSections = [
        {
            title: "Features",
            links: ["Core features", "Pro experience", "Integrations", "Best practices"]
        },
        {
            title: "Learn more",
            links: ["Blog", "Case studies", "Customer stories"]
        },
        {
            title: "Support",
            links: ["Contact", "Support", "Legal"]
        }
    ];

    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-8 md:px-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">

                {/* Column 1: Branding and Socials */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">Studey Node</h2>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                        Descriptive line about what your company does. This helps students understand the value of the platform.
                    </p>
                    <div className="flex gap-5 text-gray-400">
                        {/* Instagram SVG */}
                        <a href="#" className="hover:text-purple-600 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                        </a>

                        {/* LinkedIn SVG */}
                        <a href="#" className="hover:text-purple-600 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                        </a>

                        {/* Twitter (X) SVG */}
                        <a href="#" className="hover:text-purple-600 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                        </a>
                    </div>
                </div>

                {/* Columns 2-4: Links */}
                {footerSections.map((section, index) => (
                    <div key={index} className="space-y-4">
                        <h3 className="font-bold text-gray-900">{section.title}</h3>
                        <ul className="space-y-3">
                            {section.links.map((link, linkIndex) => (
                                <li key={linkIndex}>
                                    <a href="#" className="text-gray-500 text-sm hover:text-purple-600 transition">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Bottom thin line if needed */}
            <div className="mt-16 pt-8 border-t border-gray-50 text-center">
                <p className="text-gray-400 text-xs">© 2026 Studey Node. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;