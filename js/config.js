/**
 * config.js — Customizable wedding invitation details.
 *
 * Edit these values to personalize the game for your wedding.
 * Title screen appears before gameplay, Finish screen after reaching the church.
 */
const WEDDING_CONFIG = {
  // === TITLE SCREEN ===

  // Top label (small text above couple names)
  titleLabel: "SAVE THE DATE",

  // Couple's names (displayed large on title screen)
  couple: "Gica & Vho",

  // Tagline below the names
  titleTagline: "Game to Forever",

  // Title screen background image (optional, set null for default gradient)
  // Place in assets/, e.g. 'assets/title-bg.png'
  titleBackgroundImage: null,

  // Title screen background color (if no image)
  titleBackgroundColor: '#f5e6f0',

  // Title screen accent color (borders, decorations)
  titleAccentColor: '#f2a7c3',

  // Couple portrait image for title screen (optional)
  // Place in assets/, e.g. 'assets/couple.png'
  coupleImage: 'assets/sprites/couple.png',

  // === LOADING SCREEN ===

  // Loading screen text
  loadingText: "Loading...",

  // === QUEST/MISSION SCREEN ===

  // Label above the quest box
  questLabel: "Your mission:",

  // The quest/mission text inside the box
  questText: "Help Vho reach\nthe wedding church!",

  // === THANK YOU SCREEN (after completing, before invitation) ===

  // Banner title text
  thankyouTitle: "Mission accomplished!",

  // Thank you message text
  thankyouMessage: "Thank you for guiding the groom to his happily ever after.",

  // === FINISH SCREEN (after reaching the church) ===

  // Main heading
  heading: "You're Invited!",

  // Wedding date
  date: "Sunday, February 7, 2027",

  // Ceremony time
  time: "10:00 AM",

  // Venue / address (use \n for line breaks)
  venue: "San Antonio De Padua Parish\nPooc 2\nSilang, Cavite",

  // Additional message
  message: "Dinner & dancing to follow at the Grand Hall",

  // RSVP info
  rsvp: "RSVP by July 1st to sarah.james@email.com",

  // Background image for finish screen (optional)
  backgroundImage: null,

  // Colors
  textColor: '#333333',
  headingColor: '#8B0000',
  backgroundColor: '#FFF8F0',

  // Button text
  replayText: "Play Again"
};
