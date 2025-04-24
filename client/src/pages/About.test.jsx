// About.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import About from './About'; // Update this path to match your project structure
import { assets } from '../assets/assets'; // Mock will still be needed

// Mock the assets module
jest.mock('../assets/assets', () => ({
  assets: {
    about_image: 'mocked-image-path.jpg'
  }
}));

describe('About Component', () => {
  // Step 1: Test if the component renders without crashing
  test('renders without crashing', () => {
    render(<About />);
    expect(screen.getByText(/ABOUT/)).toBeInTheDocument();
  });

  // Step 2: Test if the headline is rendered correctly
  test('displays the correct headline', () => {
    render(<About />);
    expect(screen.getByText('ABOUT')).toBeInTheDocument();
    expect(screen.getByText('US')).toBeInTheDocument();
  });

  // Step 3: Test if the welcome text is displayed
  test('displays the welcome paragraph', () => {
    render(<About />);
    expect(screen.getByText(/Welcome to Prescripto, your trusted partner/)).toBeInTheDocument();
  });

  // Step 4: Test if "Our Vision" section is rendered
  test('displays the vision section', () => {
    render(<About />);
    expect(screen.getByText('Our Vision')).toBeInTheDocument();
    expect(screen.getByText(/Our vision at Prescripto is to create a seamless healthcare experience/)).toBeInTheDocument();
  });

  // Step 5: Test if "WHY CHOOSE US" section is rendered
  test('displays the "Why Choose Us" section', () => {
    render(<About />);
    expect(screen.getByText('WHY')).toBeInTheDocument();
    expect(screen.getByText('CHOOSE US')).toBeInTheDocument();
  });

  // Step 6: Test if all three feature boxes are rendered
  test('renders all three feature boxes', () => {
    render(<About />);
    expect(screen.getByText('EFFICIENCY:')).toBeInTheDocument();
    expect(screen.getByText('CONVENIENCE:')).toBeInTheDocument();
    expect(screen.getByText('PERSONALIZATION:')).toBeInTheDocument();
  });

  // Step 7: Test if each feature box has the correct content
  test('each feature box has correct description', () => {
    render(<About />);
    expect(screen.getByText(/Streamlined appointment scheduling/)).toBeInTheDocument();
    expect(screen.getByText(/Access to a network of trusted healthcare professionals/)).toBeInTheDocument();
    expect(screen.getByText(/Tailored recommendations and reminders/)).toBeInTheDocument();
  });

  // Step 8: Test hover styles (Note: Testing CSS hover states directly is challenging in Jest/RTL)
  test('feature boxes have hover classes applied', () => {
    render(<About />);
    const featureBoxes = screen.getAllByText(/EFFICIENCY:|CONVENIENCE:|PERSONALIZATION:/i);
    
    featureBoxes.forEach(box => {
      const parentElement = box.closest('div');
      expect(parentElement).toHaveClass('hover:bg-primary');
      expect(parentElement).toHaveClass('hover:text-white');
      expect(parentElement).toHaveClass('transition-all');
    });
  });

  // Step 9: Test responsive design classes
  test('responsive design classes are applied correctly', () => {
    render(<About />);
    
    // Main container responsiveness
    const mainContentDiv = screen.getByText(/Welcome to Prescripto/).closest('div').parentElement;
    expect(mainContentDiv).toHaveClass('flex');
    expect(mainContentDiv).toHaveClass('flex-col');
    expect(mainContentDiv).toHaveClass('md:flex-row');
    
    // Feature boxes container responsiveness
    const featureBoxesContainer = screen.getByText('EFFICIENCY:').closest('div').parentElement;
    expect(featureBoxesContainer).toHaveClass('flex');
    expect(featureBoxesContainer).toHaveClass('flex-col');
    expect(featureBoxesContainer).toHaveClass('md:flex-row');
  });
});