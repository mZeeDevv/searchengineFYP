import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-green-800 mb-6">About Our Fashion Visual Search</h1>
            
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold text-green-700 mb-4">Meet the Team</h2>
              
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="flex-1 bg-green-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Hamnah Naeem</h3>
                  <p className="text-gray-700">
                    //Hamnah will add her info here
                  </p>
                </div>
                
                <div className="flex-1 bg-green-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Eman</h3>
                  <p className="text-gray-700">
                   //Eman will add her info here
                  </p>
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold text-green-700 mb-4">Our Project</h2>
              
              <p className="mb-4">
                This project was developed as our Final Year Project to demonstrate the practical applications of visual search technology in the fashion industry. We've created a comprehensive solution that helps users find clothing items and accessories based on visual similarity rather than traditional text-based search.
              </p>
              
              <p className="mb-4">
                Our visual search platform allows users to:
              </p>
              
              <ul className="list-disc ml-6 mb-6 space-y-2">
                <li>Upload images of clothing items they like</li>
                <li>Discover visually similar products in our database</li>
                <li>Browse through a curated collection of fashion items</li>
                <li>Get personalized recommendations based on their preferences</li>
                <li>Explore new fashion trends through visual discovery</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-green-700 mb-4">Technology Stack</h2>
              
              <p className="mb-4">
                Our application leverages cutting-edge technologies to deliver a seamless visual search experience:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-1">Frontend</h3>
                  <p className="text-gray-700">React, TailwindCSS</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-1">Backend</h3>
                  <p className="text-gray-700">FastAPI, Python</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-1">Machine Learning</h3>
                  <p className="text-gray-700">TensorFlow, Computer Vision Models</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-1">Storage</h3>
                  <p className="text-gray-700">Firebase, Qdrant Vector Database</p>
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold text-green-700 mb-4">Our Mission</h2>
              
              <p className="mb-4">
                We believe that visual search is the future of e-commerce, especially in fashion where aesthetics and style are so important. Our mission is to make discovering new products intuitive and enjoyable by leveraging the power of computer vision and machine learning.
              </p>
              
              <p className="mb-4">
                As students, we developed this project not only to demonstrate our technical skills but also to create something useful that solves a real problem. Fashion discovery shouldn't be limited by the keywords you know or the text descriptions available - with visual search, you can find exactly what you're looking for even if you don't have the words to describe it.
              </p>
              
              <h2 className="text-2xl font-semibold text-green-700 mb-4">Looking Forward</h2>
              
              <p>
                This project represents our commitment to innovation in the field of computer science. We're constantly working to improve the accuracy of our visual search algorithms, enhance the user experience, and expand our database of fashion items. We welcome feedback and are excited to continue developing this platform as we move forward in our careers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
