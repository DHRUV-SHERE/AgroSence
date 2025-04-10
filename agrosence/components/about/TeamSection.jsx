import React from 'react';
import TeamCard from './TeamCard';
import { resource } from '../../resource';

const TeamSection = () => {
  const teamMembers = [
    {
      image: `${resource.Jeet.src}`,
      name: "Jeet Jani",
      role: "UI/UX Designer & Front end developer",
      instagram: "https://www.instagram.com/jeet_jani_17/",
      github: "https://github.com/janijeet17",
      linkedin: "https://www.linkedin.com/in/jeet-jani-7a5267248/"
    },
    {
      image: `${resource.Dhruv.src}`,
      name: "Dhruv Shere",
      role: "Front end & Back end developer",
      instagram: "https://www.instagram.com/sheredhruv/",
      github: "https://github.com/DHRUV-SHERE",
      linkedin: "https://www.linkedin.com/in/dhruv-shere/"
    },
    {
      image: `${resource.Herin.src}`,
      name: "Herin Patel",
      role: "Cloud Engineer & Back end developer",
      instagram: "https://www.instagram.com/herin.567/",
      github: "https://github.com/Herin27",
      linkedin: "https://www.linkedin.com/in/herin-patel-5a6b3b30a/"
    }
  ];

  return (
    <section className="team-section py-5 bg-light">
      <div className="container">
        <h2 className="text-center mb-5">Our Team</h2>
        <div className="row">
          {teamMembers.map((member, index) => (
            <TeamCard key={index} {...member} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
