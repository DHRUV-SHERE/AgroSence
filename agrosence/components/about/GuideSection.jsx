import React from 'react';
import { resource } from '../../resource';

const GuideSection = () => {
  return (
    <section className="guide-section py-5" style={{ backgroundColor: '#f9f9f9' }}>
      <div className="container">
        <h2 className="text-center mb-5 fs-2 fw-bold" style={{ color: '#333' }}>Our Guide</h2>
        <div className="row align-items-center justify-content-center">
          <div className="col-lg-4 mb-4 mb-lg-0 text-center">
            <img 
              src={resource.KMP.src}
              alt="Prof. Kavindra M. Patel"
              className="img-fluid rounded border border-2 border-Secondary"
              style={{ width: '250px', height: '300px', objectFit: 'cover' }}
            />
          </div>
          <div className="col-lg-8">
            <h3 className="mb-3 fw-bold" style={{ color: '#252525' }}>Prof. Kavindra M. Patel</h3>
            <p className="mb-3" style={{ fontSize: '18px', color: '#555', textAlign: 'justify' }}>
              Kavindra Patel received his B.E. degree in Computer Engineering from North Gujarat University (NGU), Patan in 2011 and his M.E. degree in Computer Science and Engineering from Gujarat Technological University (GTU), Ahmedabad in 2014.
            </p>
            <p style={{ fontSize: '18px', color: '#555', textAlign: 'justify' }}>
              We are deeply grateful to our esteemed guide for his constant support and invaluable guidance throughout the development of this project. His humble and respectful nature has always made it easy for us to approach him with any challenges we faced. Sir's insightful suggestions and problem-solving approach have helped us overcome obstacles and grow both technically and personally. His dedication to sharing new knowledge and encouraging creativity has been a significant source of motivation for our entire team. We truly appreciate his mentorship and are honored to have him as our guide.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuideSection;
