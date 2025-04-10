import React from 'react';
import { FaInstagram, FaGithub, FaLinkedin } from 'react-icons/fa'; // Importing React Icons

const TeamCard = ({ image, name, role, instagram, github, linkedin }) => {
  return (
    <div className="col-lg-4 col-md-6 mb-4">
      <div className="card h-100 border-0 shadow-sm p-4">
        <img 
          src={image}  
          alt={name}
          className="rounded img-fluid w-100 border border-2"
          style={{ height: '350px',width:'auto', objectFit: 'cover' }}
        />
        <div className="card-body text-center">
          <h5 className="card-title mb-1">{name}</h5>
          <p className="card-text text-muted">{role}</p>

          {/* Social Media Links */}
          <div className="d-flex justify-content-center mt-3">
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="mx-2 text-dark">
                <FaInstagram size={24} />
              </a>
            )}
            {github && (
              <a href={github} target="_blank" rel="noopener noreferrer" className="mx-2 text-dark">
                <FaGithub size={24} />
              </a>
            )}
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noopener noreferrer" className="mx-2 text-dark">
                <FaLinkedin size={24} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
