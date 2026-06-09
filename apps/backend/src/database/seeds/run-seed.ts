import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

import { ExamType } from '../entities/exam-type.entity';
import { Subject } from '../entities/subject.entity';
import { Chapter } from '../entities/chapter.entity';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://airix_user:airix_dev_password@localhost:5432/airix_db_dev',
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  console.log('Connected to database');

  // Exam Types
  const examTypeRepo = dataSource.getRepository(ExamType);
  const neet = await examTypeRepo.save(examTypeRepo.create({ code: 'NEET', name: 'NEET UG', description: 'National Eligibility cum Entrance Test', isActive: true }));
  const jee = await examTypeRepo.save(examTypeRepo.create({ code: 'JEE', name: 'JEE Main', description: 'Joint Entrance Examination', isActive: true }));
  console.log('✅ Exam types seeded');

  // Subjects for NEET
  const subjectRepo = dataSource.getRepository(Subject);
  const biology = await subjectRepo.save(subjectRepo.create({ code: 'BIOLOGY', name: 'Biology', description: 'Botany and Zoology', color: '#4AE26B', displayOrder: 1, examTypeId: neet.id }));
  const physics = await subjectRepo.save(subjectRepo.create({ code: 'PHYSICS', name: 'Physics', description: 'Classical and Modern Physics', color: '#4A90E2', displayOrder: 2, examTypeId: neet.id }));
  const chemistry = await subjectRepo.save(subjectRepo.create({ code: 'CHEMISTRY', name: 'Chemistry', description: 'Physical, Organic and Inorganic Chemistry', color: '#E24A4A', displayOrder: 3, examTypeId: neet.id }));
  console.log('✅ Subjects seeded');

  // Biology Chapters (NCERT Class 11 & 12)
  const chapterRepo = dataSource.getRepository(Chapter);
  const bioChapters = [
    { name: 'The Living World', code: 'BIO_C01', neetWeightage: 1, displayOrder: 1 },
    { name: 'Biological Classification', code: 'BIO_C02', neetWeightage: 2, displayOrder: 2 },
    { name: 'Plant Kingdom', code: 'BIO_C03', neetWeightage: 3, displayOrder: 3 },
    { name: 'Animal Kingdom', code: 'BIO_C04', neetWeightage: 4, displayOrder: 4 },
    { name: 'Morphology of Flowering Plants', code: 'BIO_C05', neetWeightage: 5, displayOrder: 5 },
    { name: 'Anatomy of Flowering Plants', code: 'BIO_C06', neetWeightage: 3, displayOrder: 6 },
    { name: 'Structural Organisation in Animals', code: 'BIO_C07', neetWeightage: 2, displayOrder: 7 },
    { name: 'Cell: The Unit of Life', code: 'BIO_C08', neetWeightage: 5, displayOrder: 8 },
    { name: 'Biomolecules', code: 'BIO_C09', neetWeightage: 4, displayOrder: 9 },
    { name: 'Cell Cycle and Cell Division', code: 'BIO_C10', neetWeightage: 5, displayOrder: 10 },
    { name: 'Transport in Plants', code: 'BIO_C11', neetWeightage: 2, displayOrder: 11 },
    { name: 'Mineral Nutrition', code: 'BIO_C12', neetWeightage: 2, displayOrder: 12 },
    { name: 'Photosynthesis in Higher Plants', code: 'BIO_C13', neetWeightage: 5, displayOrder: 13 },
    { name: 'Respiration in Plants', code: 'BIO_C14', neetWeightage: 3, displayOrder: 14 },
    { name: 'Plant Growth and Development', code: 'BIO_C15', neetWeightage: 3, displayOrder: 15 },
    { name: 'Digestion and Absorption', code: 'BIO_C16', neetWeightage: 4, displayOrder: 16 },
    { name: 'Breathing and Exchange of Gases', code: 'BIO_C17', neetWeightage: 3, displayOrder: 17 },
    { name: 'Body Fluids and Circulation', code: 'BIO_C18', neetWeightage: 4, displayOrder: 18 },
    { name: 'Excretory Products and Their Elimination', code: 'BIO_C19', neetWeightage: 4, displayOrder: 19 },
    { name: 'Locomotion and Movement', code: 'BIO_C20', neetWeightage: 3, displayOrder: 20 },
    { name: 'Neural Control and Coordination', code: 'BIO_C21', neetWeightage: 4, displayOrder: 21 },
    { name: 'Chemical Coordination and Integration', code: 'BIO_C22', neetWeightage: 4, displayOrder: 22 },
    { name: 'Reproduction in Organisms', code: 'BIO_C23', neetWeightage: 2, displayOrder: 23 },
    { name: 'Sexual Reproduction in Flowering Plants', code: 'BIO_C24', neetWeightage: 5, displayOrder: 24 },
    { name: 'Human Reproduction', code: 'BIO_C25', neetWeightage: 5, displayOrder: 25 },
    { name: 'Reproductive Health', code: 'BIO_C26', neetWeightage: 2, displayOrder: 26 },
    { name: 'Principles of Inheritance and Variation', code: 'BIO_C27', neetWeightage: 8, displayOrder: 27 },
    { name: 'Molecular Basis of Inheritance', code: 'BIO_C28', neetWeightage: 8, displayOrder: 28 },
    { name: 'Evolution', code: 'BIO_C29', neetWeightage: 4, displayOrder: 29 },
    { name: 'Human Health and Disease', code: 'BIO_C30', neetWeightage: 4, displayOrder: 30 },
    { name: 'Strategies for Enhancement in Food Production', code: 'BIO_C31', neetWeightage: 2, displayOrder: 31 },
    { name: 'Microbes in Human Welfare', code: 'BIO_C32', neetWeightage: 3, displayOrder: 32 },
    { name: 'Biotechnology: Principles and Processes', code: 'BIO_C33', neetWeightage: 5, displayOrder: 33 },
    { name: 'Biotechnology and its Applications', code: 'BIO_C34', neetWeightage: 4, displayOrder: 34 },
    { name: 'Organisms and Populations', code: 'BIO_C35', neetWeightage: 3, displayOrder: 35 },
    { name: 'Ecosystem', code: 'BIO_C36', neetWeightage: 3, displayOrder: 36 },
    { name: 'Biodiversity and Conservation', code: 'BIO_C37', neetWeightage: 3, displayOrder: 37 },
    { name: 'Environmental Issues', code: 'BIO_C38', neetWeightage: 2, displayOrder: 38 },
  ];

  for (const ch of bioChapters) {
    await chapterRepo.save(chapterRepo.create({ ...ch, subjectId: biology.id, estimatedHours: Math.ceil(ch.neetWeightage * 1.5), isActive: true }));
  }

  // Physics Chapters
  const phyChapters = [
    { name: 'Physical World', code: 'PHY_C01', neetWeightage: 1, displayOrder: 1 },
    { name: 'Units and Measurements', code: 'PHY_C02', neetWeightage: 2, displayOrder: 2 },
    { name: 'Motion in a Straight Line', code: 'PHY_C03', neetWeightage: 3, displayOrder: 3 },
    { name: 'Motion in a Plane', code: 'PHY_C04', neetWeightage: 3, displayOrder: 4 },
    { name: 'Laws of Motion', code: 'PHY_C05', neetWeightage: 4, displayOrder: 5 },
    { name: 'Work, Energy and Power', code: 'PHY_C06', neetWeightage: 4, displayOrder: 6 },
    { name: 'System of Particles and Rotational Motion', code: 'PHY_C07', neetWeightage: 5, displayOrder: 7 },
    { name: 'Gravitation', code: 'PHY_C08', neetWeightage: 3, displayOrder: 8 },
    { name: 'Mechanical Properties of Solids', code: 'PHY_C09', neetWeightage: 2, displayOrder: 9 },
    { name: 'Mechanical Properties of Fluids', code: 'PHY_C10', neetWeightage: 3, displayOrder: 10 },
    { name: 'Thermal Properties of Matter', code: 'PHY_C11', neetWeightage: 3, displayOrder: 11 },
    { name: 'Thermodynamics', code: 'PHY_C12', neetWeightage: 4, displayOrder: 12 },
    { name: 'Kinetic Theory', code: 'PHY_C13', neetWeightage: 3, displayOrder: 13 },
    { name: 'Oscillations', code: 'PHY_C14', neetWeightage: 3, displayOrder: 14 },
    { name: 'Waves', code: 'PHY_C15', neetWeightage: 4, displayOrder: 15 },
    { name: 'Electric Charges and Fields', code: 'PHY_C16', neetWeightage: 4, displayOrder: 16 },
    { name: 'Electrostatic Potential and Capacitance', code: 'PHY_C17', neetWeightage: 5, displayOrder: 17 },
    { name: 'Current Electricity', code: 'PHY_C18', neetWeightage: 5, displayOrder: 18 },
    { name: 'Moving Charges and Magnetism', code: 'PHY_C19', neetWeightage: 4, displayOrder: 19 },
    { name: 'Magnetism and Matter', code: 'PHY_C20', neetWeightage: 2, displayOrder: 20 },
    { name: 'Electromagnetic Induction', code: 'PHY_C21', neetWeightage: 4, displayOrder: 21 },
    { name: 'Alternating Current', code: 'PHY_C22', neetWeightage: 4, displayOrder: 22 },
    { name: 'Electromagnetic Waves', code: 'PHY_C23', neetWeightage: 3, displayOrder: 23 },
    { name: 'Ray Optics and Optical Instruments', code: 'PHY_C24', neetWeightage: 5, displayOrder: 24 },
    { name: 'Wave Optics', code: 'PHY_C25', neetWeightage: 4, displayOrder: 25 },
    { name: 'Dual Nature of Radiation and Matter', code: 'PHY_C26', neetWeightage: 3, displayOrder: 26 },
    { name: 'Atoms', code: 'PHY_C27', neetWeightage: 3, displayOrder: 27 },
    { name: 'Nuclei', code: 'PHY_C28', neetWeightage: 3, displayOrder: 28 },
    { name: 'Semiconductor Electronics', code: 'PHY_C29', neetWeightage: 4, displayOrder: 29 },
  ];

  for (const ch of phyChapters) {
    await chapterRepo.save(chapterRepo.create({ ...ch, subjectId: physics.id, estimatedHours: Math.ceil(ch.neetWeightage * 1.5), isActive: true }));
  }

  // Chemistry Chapters
  const chemChapters = [
    { name: 'Some Basic Concepts of Chemistry', code: 'CHE_C01', neetWeightage: 2, displayOrder: 1 },
    { name: 'Structure of Atom', code: 'CHE_C02', neetWeightage: 3, displayOrder: 2 },
    { name: 'Classification of Elements and Periodicity', code: 'CHE_C03', neetWeightage: 2, displayOrder: 3 },
    { name: 'Chemical Bonding and Molecular Structure', code: 'CHE_C04', neetWeightage: 5, displayOrder: 4 },
    { name: 'States of Matter', code: 'CHE_C05', neetWeightage: 2, displayOrder: 5 },
    { name: 'Thermodynamics', code: 'CHE_C06', neetWeightage: 4, displayOrder: 6 },
    { name: 'Equilibrium', code: 'CHE_C07', neetWeightage: 5, displayOrder: 7 },
    { name: 'Redox Reactions', code: 'CHE_C08', neetWeightage: 2, displayOrder: 8 },
    { name: 'Hydrogen', code: 'CHE_C09', neetWeightage: 2, displayOrder: 9 },
    { name: 'The s-Block Elements', code: 'CHE_C10', neetWeightage: 3, displayOrder: 10 },
    { name: 'The p-Block Elements (Class 11)', code: 'CHE_C11', neetWeightage: 3, displayOrder: 11 },
    { name: 'Organic Chemistry: Basic Principles', code: 'CHE_C12', neetWeightage: 4, displayOrder: 12 },
    { name: 'Hydrocarbons', code: 'CHE_C13', neetWeightage: 3, displayOrder: 13 },
    { name: 'Environmental Chemistry', code: 'CHE_C14', neetWeightage: 2, displayOrder: 14 },
    { name: 'The Solid State', code: 'CHE_C15', neetWeightage: 3, displayOrder: 15 },
    { name: 'Solutions', code: 'CHE_C16', neetWeightage: 4, displayOrder: 16 },
    { name: 'Electrochemistry', code: 'CHE_C17', neetWeightage: 4, displayOrder: 17 },
    { name: 'Chemical Kinetics', code: 'CHE_C18', neetWeightage: 4, displayOrder: 18 },
    { name: 'Surface Chemistry', code: 'CHE_C19', neetWeightage: 2, displayOrder: 19 },
    { name: 'General Principles of Isolation of Elements', code: 'CHE_C20', neetWeightage: 2, displayOrder: 20 },
    { name: 'The p-Block Elements (Class 12)', code: 'CHE_C21', neetWeightage: 4, displayOrder: 21 },
    { name: 'The d and f Block Elements', code: 'CHE_C22', neetWeightage: 3, displayOrder: 22 },
    { name: 'Coordination Compounds', code: 'CHE_C23', neetWeightage: 4, displayOrder: 23 },
    { name: 'Haloalkanes and Haloarenes', code: 'CHE_C24', neetWeightage: 4, displayOrder: 24 },
    { name: 'Alcohols, Phenols and Ethers', code: 'CHE_C25', neetWeightage: 4, displayOrder: 25 },
    { name: 'Aldehydes, Ketones and Carboxylic Acids', code: 'CHE_C26', neetWeightage: 5, displayOrder: 26 },
    { name: 'Amines', code: 'CHE_C27', neetWeightage: 4, displayOrder: 27 },
    { name: 'Biomolecules', code: 'CHE_C28', neetWeightage: 3, displayOrder: 28 },
    { name: 'Polymers', code: 'CHE_C29', neetWeightage: 2, displayOrder: 29 },
    { name: 'Chemistry in Everyday Life', code: 'CHE_C30', neetWeightage: 2, displayOrder: 30 },
  ];

  for (const ch of chemChapters) {
    await chapterRepo.save(chapterRepo.create({ ...ch, subjectId: chemistry.id, estimatedHours: Math.ceil(ch.neetWeightage * 1.5), isActive: true }));
  }

  console.log('✅ All chapters seeded');
  console.log('🎉 Database seed complete!');
  await dataSource.destroy();
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
