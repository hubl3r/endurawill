// State Requirements Seed Data
// Priority states: FL, TX, CA, NY, NC, GA, IL, PA, OH, AZ

export const STATE_REQUIREMENTS_SEED = [
  {
    state: "FL",
    stateName: "Florida",
    
    // Notarization
    notarizationRequired: true,
    notarizationStronglyRec: false,
    
    // Witnesses
    witnessesRequired: true,
    numberOfWitnesses: 2,
    minimumWitnessAge: 18,
    witnessesOrNotary: false,
    
    // Witness restrictions
    agentCannotBeWitness: true,
    notaryCannotBeWitness: false,
    spouseCannotBeWitness: true,
    relativesCannotBeWitness: true,
    witnessRestrictions: "Witnesses cannot be: attorney-in-fact (agent), spouse, children, or blood relatives of the principal.",
    
    // Statutory Forms
    hasStatutoryForm: true,
    statutoryFormRequired: true,
    statutoryFormCitation: "Fla. Stat. §709.2102",
    statutoryFormNotes: "Florida requires use of the exact statutory form. Custom POA forms will likely be rejected by banks and title companies.",
    
    // Durability
    durabilityRequired: true,
    durabilityWording: "This durable power of attorney is not affected by subsequent incapacity of the principal.",
    defaultDurability: "durable",
    
    // Springing POA
    allowsSpringing: false,
    springingBannedReason: "Florida banned springing POAs after 2011 (Fla. Stat. §709.08)",
    
    // Agent Requirements
    requiresAgentSignature: false,
    requiresAgentNotarization: false,
    
    // Required Notices
    requiredPrincipalNotice: "NOTICE: THE POWERS GRANTED BY THIS DOCUMENT ARE BROAD AND SWEEPING...",
    requiredAgentNotice: "AGENT'S DUTIES: When you accept the authority granted under this power of attorney...",
    
    // Recording
    recordingMandatoryFor: ["real_estate"],
    recordingInstructions: "Must be recorded with county clerk in county where property is located before use for real estate transactions",
    estimatedRecordingFee: 30.00,
    
    // Hot Powers
    hotPowersRequireSeparateConsent: true,
    hotPowersList: ["gifts", "trust_modification", "beneficiary_changes", "homestead_transactions"],
    giftingAnnualLimit: 18000.00, // 2025 IRS annual exclusion
    
    specialNotes: "Florida is VERY STRICT. Must use statutory form §709.2102. Agent duties clause recommended. Recording mandatory for real estate.",
    strictnessLevel: "very_strict",
    
    allowsRemoteNotarization: true
  },
  
  {
    state: "TX",
    stateName: "Texas",
    
    notarizationRequired: true,
    notarizationStronglyRec: false,
    
    witnessesRequired: false,
    numberOfWitnesses: 0,
    minimumWitnessAge: 18,
    witnessesOrNotary: false,
    
    agentCannotBeWitness: true,
    notaryCannotBeWitness: false,
    spouseCannotBeWitness: false,
    relativesCannotBeWitness: false,
    witnessRestrictions: "Witnesses not required, but if used, agent cannot be witness.",
    
    hasStatutoryForm: true,
    statutoryFormRequired: true,
    statutoryFormCitation: "Tex. Estates Code §752.051",
    statutoryFormNotes: "Texas statutory durable POA form strongly recommended for acceptance by institutions.",
    
    durabilityRequired: true,
    durabilityWording: "This power of attorney is not affected by subsequent disability or incapacity of the principal.",
    defaultDurability: "durable",
    
    allowsSpringing: true,
    numberOfPhysiciansRequired: 1,
    courtDeterminationAllowed: false,
    
    requiresAgentSignature: false,
    requiresAgentNotarization: false,
    
    requiredPrincipalNotice: "NOTICE: THE POWERS GRANTED BY THIS DOCUMENT ARE BROAD AND SWEEPING...",
    requiredAgentNotice: "IMPORTANT INFORMATION FOR AGENT: Agent's Duties...",
    
    recordingMandatoryFor: ["real_estate"],
    recordingInstructions: "Record with county clerk where property located",
    estimatedRecordingFee: 35.00,
    
    hotPowersRequireSeparateConsent: true,
    hotPowersList: ["gifts", "trust_modification", "beneficiary_changes"],
    giftingAnnualLimit: 18000.00,
    
    specialNotes: "Texas has detailed statutory form. Digital assets explicitly included. Springing requires physician certification.",
    strictnessLevel: "strict",
    
    allowsRemoteNotarization: true
  },
  
  {
    state: "CA",
    stateName: "California",
    
    notarizationRequired: true,
    notarizationStronglyRec: false,
    
    witnessesRequired: false,
    numberOfWitnesses: 0,
    minimumWitnessAge: 18,
    witnessesOrNotary: true,
    
    agentCannotBeWitness: true,
    notaryCannotBeWitness: false,
    spouseCannotBeWitness: false,
    relativesCannotBeWitness: false,
    witnessRestrictions: "Notary OR 2 witnesses. If witnesses used, one witness cannot be agent or related to principal.",
    
    hasStatutoryForm: true,
    statutoryFormRequired: false,
    statutoryFormCitation: "Cal. Probate Code §4401",
    statutoryFormNotes: "California statutory short form strongly recommended but not mandatory.",
    
    durabilityRequired: true,
    durabilityWording: "This power of attorney shall not be affected by subsequent incapacity of the principal.",
    defaultDurability: "non-durable", // CA defaults to non-durable unless stated!
    
    allowsSpringing: true,
    numberOfPhysiciansRequired: 2, // California requires 2 physicians as safeguard
    courtDeterminationAllowed: false,
    
    requiresAgentSignature: true,
    requiresAgentNotarization: false,
    agentAcceptanceWording: "BY ACCEPTING OR ACTING UNDER THE APPOINTMENT, THE AGENT ASSUMES THE FIDUCIARY AND OTHER LEGAL RESPONSIBILITIES OF AN AGENT.",
    
    requiredPrincipalNotice: "NOTICE: THE POWERS GRANTED BY THIS DOCUMENT ARE BROAD AND SWEEPING...",
    
    recordingMandatoryFor: [],
    recordingInstructions: "Recording optional but recommended for real estate transactions",
    estimatedRecordingFee: 30.00,
    
    hotPowersRequireSeparateConsent: false,
    giftingAnnualLimit: 18000.00,
    
    specialNotes: "California defaults to NON-DURABLE unless durability clause included. Penalty of perjury notary form unique to CA. Agent signature required when using POA.",
    strictnessLevel: "strict",
    
    allowsRemoteNotarization: true
  },
  
  {
    state: "NY",
    stateName: "New York",
    
    notarizationRequired: true,
    notarizationStronglyRec: false,
    
    witnessesRequired: true,
    numberOfWitnesses: 2,
    minimumWitnessAge: 18,
    witnessesOrNotary: false,
    
    agentCannotBeWitness: true,
    notaryCannotBeWitness: true, // NY does not allow notary to be witness
    spouseCannotBeWitness: false,
    relativesCannotBeWitness: false,
    witnessRestrictions: "2 witnesses required. Agent and notary cannot be witnesses.",
    
    hasStatutoryForm: true,
    statutoryFormRequired: true,
    statutoryFormCitation: "N.Y. Gen. Oblig. Law §5-1501",
    statutoryFormNotes: "Must use 2021 statutory short form. Banks in NY are extremely strict about form compliance.",
    
    durabilityRequired: true,
    durabilityWording: "This power of attorney shall not be affected by my subsequent incapacity.",
    defaultDurability: "durable",
    
    allowsSpringing: true,
    numberOfPhysiciansRequired: 1,
    courtDeterminationAllowed: false,
    
    requiresAgentSignature: true,
    requiresAgentNotarization: true, // NY requires agent to sign and notarize separately
    agentAcceptanceWording: "I have read the foregoing Power of Attorney. I am the person identified therein as agent for the principal named therein.",
    
    requiredPrincipalNotice: "CAUTION TO THE PRINCIPAL: Your Power of Attorney is an important document...",
    requiredAgentNotice: "IMPORTANT INFORMATION FOR THE AGENT...",
    
    recordingMandatoryFor: ["real_estate"],
    recordingInstructions: "Must record with county clerk. Revocation must also be recorded if original was recorded.",
    estimatedRecordingFee: 50.00,
    
    hotPowersRequireSeparateConsent: true,
    hotPowersList: ["gifts_over_annual_exclusion"],
    giftingAnnualLimit: 18000.00,
    
    specialNotes: "NEW YORK IS EXTREMELY STRICT. Must use 2021 statutory form. Agent must sign/notarize separately. Gifts over $18K require separate notarized Gifts Rider. Monitor designation option available.",
    strictnessLevel: "extremely_strict",
    
    allowsRemoteNotarization: true
  },
  
  {
    state: "NC",
    stateName: "North Carolina",
    
    notarizationRequired: true,
    notarizationStronglyRec: false,
    
    witnessesRequired: true,
    numberOfWitnesses: 2,
    minimumWitnessAge: 18,
    witnessesOrNotary: false,
    
    agentCannotBeWitness: true,
    notaryCannotBeWitness: false,
    spouseCannotBeWitness: false,
    relativesCannotBeWitness: false,
    witnessRestrictions: "Agent cannot be witness. One witness must be disinterested.",
    
    hasStatutoryForm: true,
    statutoryFormRequired: true,
    statutoryFormCitation: "N.C.G.S. §32C-3-301",
    statutoryFormNotes: "Must use North Carolina Statutory Short Form. Recording mandatory for real estate use.",
    
    durabilityRequired: true,
    durabilityWording: "This power of attorney shall continue after incapacity.",
    defaultDurability: "durable",
    
    allowsSpringing: true,
    numberOfPhysiciansRequired: 1,
    courtDeterminationAllowed: false,
    
    requiresAgentSignature: false,
    requiresAgentNotarization: false,
    
    requiredPrincipalNotice: "IMPORTANT INFORMATION: This power of attorney authorizes another person...",
    requiredAgentNotice: "IMPORTANT INFORMATION FOR AGENT: Agent's Duties...",
    
    recordingMandatoryFor: ["real_estate"],
    recordingInstructions: "Recording with county register mandatory for real estate transactions",
    estimatedRecordingFee: 26.00,
    
    hotPowersRequireSeparateConsent: true,
    hotPowersList: ["gifts", "beneficiary_changes", "trust_modification"],
    giftingAnnualLimit: 18000.00,
    
    specialNotes: "North Carolina requires statutory form. Recording clause must be included. Agent given power to name successor agent if principal grants that authority.",
    strictnessLevel: "strict",
    
    allowsRemoteNotarization: true
  },
  
  {
    state: "GA",
    stateName: "Georgia",
    
    notarizationRequired: true,
    notarizationStronglyRec: false,
    
    witnessesRequired: true,
    numberOfWitnesses: 2,
    minimumWitnessAge: 18,
    witnessesOrNotary: false,
    
    agentCannotBeWitness: true,
    notaryCannotBeWitness: false,
    spouseCannotBeWitness: false,
    relativesCannotBeWitness: false,
    witnessRestrictions: "Agent cannot be witness.",
    
    hasStatutoryForm: false,
    statutoryFormRequired: false,
    
    durabilityRequired: true,
    durabilityWording: "This power of attorney shall not be affected by disability of the principal.",
    defaultDurability: "durable",
    
    allowsSpringing: true,
    numberOfPhysiciansRequired: 1,
    courtDeterminationAllowed: false,
    
    requiresAgentSignature: false,
    requiresAgentNotarization: false,
    
    recordingMandatoryFor: ["real_estate"],
    recordingInstructions: "Record with clerk of superior court in county where property located",
    estimatedRecordingFee: 30.00,
    
    hotPowersRequireSeparateConsent: false,
    giftingAnnualLimit: 18000.00,
    
    specialNotes: "Georgia allows custom forms but strict recording requirements for real estate.",
    strictnessLevel: "standard",
    
    allowsRemoteNotarization: true
  },
  
  {
    state: "IL",
    stateName: "Illinois",
    
    notarizationRequired: true,
    notarizationStronglyRec: false,
    
    witnessesRequired: true,
    numberOfWitnesses: 1, // Illinois requires only 1 witness
    minimumWitnessAge: 18,
    witnessesOrNotary: false,
    
    agentCannotBeWitness: true,
    notaryCannotBeWitness: false,
    spouseCannotBeWitness: false,
    relativesCannotBeWitness: true,
    witnessRestrictions: "Witness cannot be: agent, attending physician, mental health provider, relative of physician, owner/operator of healthcare facility, parent/sibling/descendant of principal or agent.",
    
    hasStatutoryForm: true,
    statutoryFormRequired: true,
    statutoryFormCitation: "755 ILCS 45/3-3",
    statutoryFormNotes: "Must use Illinois Statutory Short Form Property POA. Exact statutory short form with initials for each power.",
    
    durabilityRequired: true,
    durabilityWording: "This power of attorney shall not be affected by disability of the principal.",
    defaultDurability: "durable",
    
    allowsSpringing: true,
    numberOfPhysiciansRequired: 1,
    courtDeterminationAllowed: false,
    
    requiresAgentSignature: false,
    requiresAgentNotarization: false,
    
    requiredPrincipalNotice: "NOTICE TO THE INDIVIDUAL SIGNING THE ILLINOIS STATUTORY SHORT FORM...",
    requiredAgentNotice: "NOTICE TO AGENT: POWER OF ATTORNEY FOR PROPERTY...",
    
    recordingMandatoryFor: ["real_estate"],
    recordingInstructions: "Record with county recorder in county where property located",
    estimatedRecordingFee: 35.00,
    
    hotPowersRequireSeparateConsent: true,
    hotPowersList: ["gifts", "trust_modification", "beneficiary_changes"],
    giftingAnnualLimit: 18000.00,
    
    specialNotes: "Illinois has detailed witness restrictions. Agent certification form required for third parties to accept POA.",
    strictnessLevel: "strict",
    
    allowsRemoteNotarization: true
  },
  
  {
    state: "PA",
    stateName: "Pennsylvania",
    
    notarizationRequired: true,
    notarizationStronglyRec: false,
    
    witnessesRequired: true,
    numberOfWitnesses: 2,
    minimumWitnessAge: 18,
    witnessesOrNotary: false,
    
    agentCannotBeWitness: true,
    notaryCannotBeWitness: false,
    spouseCannotBeWitness: false,
    relativesCannotBeWitness: false,
    witnessRestrictions: "Agent cannot be witness.",
    
    hasStatutoryForm: true,
    statutoryFormRequired: true,
    statutoryFormCitation: "20 Pa.C.S. §5601",
    statutoryFormNotes: "Must include mandatory notice to principal on front page and agent acknowledgment.",
    
    durabilityRequired: true,
    durabilityWording: "This power of attorney shall not be affected by subsequent disability or incapacity of the principal.",
    defaultDurability: "durable",
    
    allowsSpringing: true,
    numberOfPhysiciansRequired: 1,
    courtDeterminationAllowed: false,
    
    requiresAgentSignature: true,
    requiresAgentNotarization: false,
    agentAcceptanceWording: "I accept this appointment and agree to act in the principal's best interest as authorized in this power of attorney.",
    
    requiredPrincipalNotice: "When you accept the authority granted under this power of attorney, a special legal relationship is created between you and the principal. This relationship imposes upon you legal duties that continue until you resign or the power of attorney is terminated or revoked...",
    requiredAgentNotice: "IMPORTANT INFORMATION FOR THE AGENT: Agent's duties...",
    
    recordingMandatoryFor: ["real_estate"],
    recordingInstructions: "Record with office of recorder of deeds in county where property located",
    estimatedRecordingFee: 40.00,
    
    hotPowersRequireSeparateConsent: true,
    hotPowersList: ["gifts", "trust_modification", "beneficiary_changes"],
    giftingAnnualLimit: 18000.00,
    
    specialNotes: "Pennsylvania requires verbatim front-page notice. Agent must sign acknowledgment. Interstate: Recognizes other states' POAs but requires PA-compliant notice for use in PA.",
    strictnessLevel: "strict",
    
    allowsRemoteNotarization: true
  },
  
  {
    state: "OH",
    stateName: "Ohio",
    
    notarizationRequired: true,
    notarizationStronglyRec: false,
    
    witnessesRequired: false,
    numberOfWitnesses: 0,
    minimumWitnessAge: 18,
    witnessesOrNotary: false,
    
    agentCannotBeWitness: true,
    notaryCannotBeWitness: false,
    spouseCannotBeWitness: false,
    relativesCannotBeWitness: false,
    witnessRestrictions: "Witnesses not required.",
    
    hasStatutoryForm: false,
    statutoryFormRequired: false,
    
    durabilityRequired: true,
    durabilityWording: "This power of attorney shall not be affected by disability of the principal.",
    defaultDurability: "durable",
    
    allowsSpringing: true,
    numberOfPhysiciansRequired: 1,
    courtDeterminationAllowed: false,
    
    requiresAgentSignature: false,
    requiresAgentNotarization: false,
    
    recordingMandatoryFor: [],
    recordingInstructions: "Recording optional but recommended for real estate",
    estimatedRecordingFee: 28.00,
    
    hotPowersRequireSeparateConsent: false,
    giftingAnnualLimit: 18000.00,
    
    specialNotes: "Ohio allows custom forms. No witnesses required.",
    strictnessLevel: "standard",
    
    allowsRemoteNotarization: true
  },
  
  {
    state: "AZ",
    stateName: "Arizona",
    
    notarizationRequired: true,
    notarizationStronglyRec: false,
    
    witnessesRequired: true,
    numberOfWitnesses: 1, // Arizona can require 1 OR none if notarized
    minimumWitnessAge: 18,
    witnessesOrNotary: true, // Flexible: 1 witness OR notary only
    
    agentCannotBeWitness: true,
    notaryCannotBeWitness: false,
    spouseCannotBeWitness: false,
    relativesCannotBeWitness: false,
    witnessRestrictions: "1 witness OR none if notarized. Agent cannot be witness.",
    
    hasStatutoryForm: false,
    statutoryFormRequired: false,
    
    durabilityRequired: true,
    durabilityWording: "This power of attorney shall not be affected by disability of the principal.",
    defaultDurability: "durable",
    
    allowsSpringing: true,
    numberOfPhysiciansRequired: 2, // Arizona sometimes requires 2 physicians OR court
    courtDeterminationAllowed: true,
    
    requiresAgentSignature: false,
    requiresAgentNotarization: false,
    
    recordingMandatoryFor: [],
    recordingInstructions: "Recording optional but recommended for real estate",
    estimatedRecordingFee: 25.00,
    
    hotPowersRequireSeparateConsent: false,
    giftingAnnualLimit: 18000.00,
    
    specialNotes: "Arizona has flexible witness requirements. Springing POA can use 1-2 physicians OR court determination.",
    strictnessLevel: "standard",
    
    allowsRemoteNotarization: true
  }
];
