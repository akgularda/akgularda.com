---
title: "We Have to Give Up Our Privacy"
date: "2026-09-23"
lastmod: "2026-09-23"
description: "Privacy as secrecy is a wasting asset: contingent history, qualified rights, commercial surrender, and Harvest Now, Decrypt Later. What deserves defense is accountability, not the locked drawer."
tags: ["Privacy", "Surveillance", "Encryption", "Quantum", "Civil Liberties"]
categories: ["Technology & Public Life"]
slug: "we-have-to-give-up-our-privacy"
draft: false
faq:
  - q: "Is this essay arguing against privacy as a right?"
    a: "No. It argues that privacy-as-secrecy is historically contingent and technologically doomed, while the objection from chilling effects and regime change still stands. The conclusion is institutional accountability, not individual concealment."
  - q: "What is Harvest Now, Decrypt Later?"
    a: "Capture encrypted traffic today and store it until a cryptographically relevant quantum computer can break public-key schemes such as RSA and ECC. The vulnerability starts the moment data is transmitted; exploitation waits for hardware."
  - q: "What should replace the privacy movement's emphasis on hiding?"
    a: "Oversight of the watchers: retention limits, sunlight on state archives, and democratic control of surveillance powers — including upward transparency at institutions, not only personal encryption habits."
---

> "A new mode of obtaining power of mind over mind, in a quantity hitherto without example."
> — Jeremy Bentham, describing the Panopticon, 1791

Let me state the unstated thing before you decide to be offended by it: the thing we call privacy is younger than the internet, weaker than its defenders can admit, and — in the specific technical sense I will use — privacy is a wasting asset. Not a right being eroded by villains, but a fortress built on a melting glacier, which we keep reinforcing because we have mistaken the act of reinforcing it for the act of being free.

This is a provocation, but it is not even a slogan. A serious case against privacy cannot be a rant; it has to walk through the strongest arguments for privacy and come out the other side still standing. So I will give the privacy supporters their best argument — the historical, the legal, the philosophical, and above all the one objection that genuinely survives — and argue that even after all of them are granted their full force, what is left standing is not the right to hide. It is something else, something the quantum machine now patiently waiting to read today's encrypted traffic has made unavoidable.

## What privacy is, and why no one can quite say

We talk about privacy as though it were a possession: a vault, a wall, a drawer with a lock. It is none of these. The leading legal scholar of the subject, Daniel Solove, opens his major treatment by conceding that privacy is "a concept in disarray", a word so overloaded that it names a dozen incompatible things at once (Solove 2008). Alan Westin's classic formulation defined it not as secrecy but as control: the claim of individuals to determine for themselves when and how information about them is communicated (Westin 1967). Helen Nissenbaum reframed it again as contextual integrity: not concealment, but the expectation that information flows according to the norms of the context in which it was shared (Nissenbaum 2009).

Notice what has already happened. The most sophisticated defenders of privacy have spent a century quietly abandoning the popular picture — the locked drawer, the wall — in favor of something far more modest and far more conditional. They defend not a fortress but a negotiated boundary, and a boundary is by definition a thing that moves.

It has certainly moved. The modern legal right to privacy is not an ancient inheritance; it was invented, and we can name the year. In 1890, Samuel Warren and Louis Brandeis published "The Right to Privacy" in the Harvard Law Review, and they wrote it for a concrete and recognizably modern reason: the arrival of instantaneous photography and a sensationalist press had made it possible, for the first time, to capture and circulate a person's likeness without consent (Warren and Brandeis 1890). The "right to be let alone" was a reaction to a technology. Before the portable camera, the village simply knew your business; the medieval household slept many to a room; the parish register recorded your sins. "Being left alone" is not a human universal. It is a brief, wealthy, modern artifact, roughly the age of the suburban bedroom door.

This matters more than it seems. If privacy is a contingent response to a particular technological moment, then it can also be a contingent casualty of another. A right that was switched on by the camera can be switched off by the things that came after the camera. There is nothing in its history to suggest otherwise.

## The law's own confession

Ask a defender of privacy whether it is a human right and they will point, correctly, to the instruments: Article 12 of the Universal Declaration of Human Rights, Article 8 of the European Convention on Human Rights, the right to respect for private life, family, home, and correspondence.

But read the second paragraph, because the drafters did. Article 8 is what jurists call a qualified right. Paragraph 1 grants it; paragraph 2 immediately permits the state to override it "in the interests of national security, public safety or the economic well-being of the country, for the prevention of disorder or crime, for the protection of health or morals, or for the protection of the rights and freedoms of others." Compare this with Article 3, the prohibition on torture, which admits no exception, no qualification, no balancing, not even in time of war. The drafters knew exactly how to write an absolute right when they meant one. For privacy, they declined.

So the very documents we wave to defend privacy contain, in the same breath, the clause that dissolves it the moment crime walks in. This is not a betrayal of privacy law; it is the design of privacy law. It was never written as a fortress. It was written as a door, and the state was handed a key on the day the ink dried. To treat privacy as sacred and inviolable is to misread the instrument that supposedly enshrines it.

## The fait accompli: you already surrendered, and not to the state

Here is the part that should end the panic about government surveillance, because the surrender already happened — commercially, voluntarily, years ago, without your vote.

You are surveilled right now, minutely and relentlessly, by entities that answer to no constitution. Shoshana Zuboff's *The Age of Surveillance Capitalism* documents the architecture: your behavior is rendered into data, the data into predictions, the predictions into products sold in markets you will never see (Zuboff 2019). The location your phone leaks to brokers you have never heard of; the three seconds you hovered over a photograph; the hour you fell asleep; the route you run — all of it is harvested, scored, and sold. Not by a ministry. By the free email you depend on and the social feed you opened twice while reading this.

The asymmetry of our fear is the tell. We are terrified of the state, which is at least in principle accountable — it holds elections, answers to courts, can be voted out — and serene about the corporation, which knows you better than your spouse, predicts you better than you predict yourself, and answers to a quarterly earnings call. If we are going to be this transparent anyway, the privacy partisan owes us an explanation for why the only watcher worth fearing is the one we can, in theory, dismiss. The secrecy you imagine you still possess is, for the most intimate facts of your life, already gone. To defend it now is to mount a defense of a ruin.

## The quantum coup de grâce: Harvest Now, Decrypt Later

There is one redoubt left, and the privacy partisan retreats to it when all else fails: encryption. Yes, they say, the data is collected, but it is collected as ciphertext. Let them hoard it; they cannot read it. Mathematics is the last wall.

The quantum computer is built to climb that wall, and the most important thing to understand is that it does not have to exist yet to win.

Begin with the mathematics. In 1994, Peter Shor showed that a sufficiently large quantum computer could factor large integers and solve discrete logarithm problems in polynomial time (Shor 1994). This is not an incremental improvement; it is the specific death of the specific problems on which essentially all asymmetric cryptography rests. RSA and elliptic-curve cryptography — the key-exchange machinery that protects banking, messaging, state secrets, and the handshake behind the padlock in your browser — are breakable by Shor's algorithm the moment the hardware is large enough. Symmetric ciphers such as AES survive at larger key sizes; the kill is concentrated in the public-key layer that establishes the keys in the first place.

Now the part that makes this a present problem rather than a future one. The attack does not require a quantum computer today. It requires only interception and storage today. An adversary captures your encrypted traffic now — a network position and cheap disk are sufficient — and warehouses it, confident that the day a cryptographically relevant quantum computer arrives, the archive becomes plaintext. This is Harvest Now, Decrypt Later (HNDL), and the European Telecommunications Standards Institute flagged it as a near-term threat years before NIST finished its response (ETSI 2015). Its defining feature is a temporal asymmetry: the vulnerability is created the instant the data is transmitted, but the exploitation is deferred until capability catches up (Mascelli and Rodden 2025).

How urgent is "later"? Michele Mosca reduced the question to an inequality: if the time required to migrate your systems to quantum-safe cryptography (x) plus the length of time your data must stay confidential (y) is greater than the time remaining until a quantum computer can break today's encryption (z), then your data is already exposed (Mosca 2018). The Global Risk Institute's 2024 expert-survey timeline places the central probability for "Q-Day" between roughly 2033 and 2037, with serious analysts clustering near 2030 give or take a couple of years (Mosca and Piani 2024). The timelines are compressing rather than receding: research published in 2025 by Google Quantum AI cut the estimated cost of breaking RSA-2048 to under a million noisy physical qubits, with a runtime measured in hours to days rather than the millennia once assumed (Gidney 2025). Run Mosca's arithmetic for any secret with a fifteen-year confidentiality requirement and the conclusion is stark: for a great deal of data generated in the early 2020s, the risk window is not approaching. It is open now.

The institutions are responding with the urgency of people who believe the clock. NIST finalized its first three post-quantum standards in August 2024 — FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), and FIPS 205 (SLH-DSA) (NIST 2024). The U.S. National Security Agency's CNSA 2.0 suite mandates migration of national-security systems by 2030 (NSA, n.d.). The European Commission published a coordinated post-quantum migration roadmap in 2025, and the G7 designated 2026 the "Year of Quantum Security" (European Commission 2025).

Here is where I part company with almost everyone who writes about HNDL, and where the concept becomes, against its usual grain, an argument against the cult of privacy.

The standard reading of HNDL is a call to arms for encryption: migrate faster, encrypt harder, rebuild the wall in quantum-resistant brick. Post-quantum migration is rational; I am not telling anyone to skip it. But step back and look at what HNDL actually reveals about secrecy as such. It tells you that confidentiality was never a permanent state, only a time-limited bet against future capability. Every secret is on a countdown. Today's unbreakable cipher is tomorrow's plaintext, and the history of cryptography is a graveyard of systems once called unbreakable: Enigma, DES, RSA-512, the hashes we have already deprecated. Quantum computing is merely the most dramatic instance of a law that was always true. To encrypt is not to make a fact safe forever; it is to postpone its disclosure and hope the postponement outlasts your need for the secret. Mosca's inequality is, read philosophically, a formula for the expiry date on concealment.

If that is the nature of secrecy, then staking your freedom on cryptographic concealment is staking it on a wasting asset — and not just any wasting asset, but one whose depreciation schedule you do not control and cannot see. You will never know which adversary harvested which archive in which year, or how close their machine is. The privacy maximalist's project — "I will protect myself by hiding better" — is therefore not merely difficult. In the long run, for anything that must stay secret for decades, it is, per Mosca, a bet you may have already lost without being told. This is the coherent sense in which privacy-as-secrecy is not just costly but futile: you are pouring effort into a fortress whose walls are dissolving on a timer.

## "If you have nothing to hide…", the sharpest blade, handled honestly

This brings us to the oldest argument in the drawer, and the one most people deploy badly. If you harbor no contraband, the intuition runs, why fear the search? If there are no drugs in your house, why not let the police in? A society with nowhere to hide is a society compelled, at last, into honesty; the closed door, on this view, protects not your freedom but your free-riding — the abuser behind it, the embezzler, the man whose neighbors "didn't want to get involved."

The intuition has serious scholarly backing, which is usually omitted. Amitai Etzioni's *The Limits of Privacy* argues, from an explicitly communitarian standpoint, that privacy is a value rather than the value, and that it routinely shields demonstrable social harms; he documents case after case where the reflexive elevation of privacy obstructs public health and public safety (Etzioni 1999). Richard Posner's economic analysis goes further: much of what we dignify as "privacy" is the strategic concealment of discrediting information — a person managing the gap between their reputation and their reality (Posner 1978). In market terms, demanding privacy is often demanding the right to misrepresent oneself, and transparency, far from being oppressive, lowers the cost of trust and improves the quality of every exchange that depends on it. On this reading, the desire to hide is frequently, if not always, the desire to deceive.

Now the part where an honest writer has to stop swinging the blade and examine it, because this argument has been demolished, and the demolition is the most important thing a critical treatment must reckon with.

Daniel Solove's rebuttal to the "nothing to hide" argument is the decisive text, and it does not say what people assume (Solove 2007). Solove does not rest on the weak claim that we all have shameful secrets. He argues that the entire framing commits a category error. It assumes privacy is about hiding bad acts, when in fact the harm of surveillance has almost nothing to do with whether you are guilty. The harms are aggregation (innocent facts combined into a portrait you never authorized), distortion (the portrait being wrong), exclusion (you having no say in how it is used), and above all the shift in power between the watched and the watcher. Glenn Greenwald put the same point as a dare: those who say they have nothing to hide have, without exception, declined to hand over their email passwords (Greenwald 2014). The search is not frightening because of what it finds. It is frightening because of what it establishes: a relationship in which one party may look and the other may only be looked at.

This rebuttal is correct, and I concede it without reservation. But watch where the concession actually leads, because the privacy partisan rarely follows it to the end.

If the harm of surveillance is not exposure of wrongdoing but asymmetry of power over aggregated data, then the remedy is not concealment. Concealment does not touch the asymmetry; it merely picks a losing fight against it, and the quantum section has just shown that this fight, over any long horizon, is lost to physics. The remedy that actually addresses Solove's harm is symmetry: auditing the watchers, constraining what they may retain and for how long, forcing the surveillance itself into the light. The "nothing to hide" debate, correctly resolved, does not rescue privacy-as-secrecy. It dissolves it, into a demand for accountable institutions. The intuition behind the open door was right in spirit: a rule-bound, warranted, genuinely accountable search costs the innocent very little. It was wrong only in its naïveté about who writes the rules, and that, once again, is an argument for accountability, not for hiding.

## Who watches the watchers, the objection that survives

I promised one objection that does not fall, and intellectual honesty requires me to name it plainly, because it is the hinge on which the whole question turns.

Every argument I have made so far smuggles in one assumption: that the watcher is good. Remove it and the cathedral collapses. The camera that catches the mugger also catches the protester, the journalist's source, the union organizer, the woman seeking a procedure her government criminalized this year. The deepest danger of total surveillance is not that it enforces today's rules; it is that it lets the rules change retroactively. The data you generate now — innocent now — sits in an archive waiting for the day "innocent" is redefined by someone you did not elect, for reasons you will not be told. Privacy, in this light, is not protection from your current government. It is insurance against your next one.

And there is a cost beneath the political one. Neil Richards has catalogued the specific dangers of surveillance to intellectual freedom (Richards 2013); the empirical record now backs him. Jonathon Penney found measurable drops in traffic to sensitive Wikipedia articles after the 2013 revelations of mass surveillance — people quietly stopped reading what they feared it was dangerous to have read (Penney 2016). Elizabeth Stoycheff documented the same chilling of ordinary speech, a spiral of silence triggered merely by the knowledge of being monitored (Stoycheff 2016). This is Foucault's panopticon doing exactly what Bentham designed it to do: the watched internalize the watcher and discipline themselves, no force required (Foucault 1977). Julie Cohen has argued that the unobserved self is not a luxury but a workshop — the only place the half-formed thought, the unpopular question, and the not-yet-brave person can take shape before they are ready to be seen (Cohen 2013). On this account, surveillance does not merely record you; over time it rewrites you into something more cautious and more obedient, and that is a graver loss than any secret.

I take this objection to be true. It is the one the rest of the essay cannot dissolve. But notice, and this is the final move, that it is not a defense of secrecy either.

The chilling effect is a function of unaccountable, one-way observation, not of observation as such. Penney's readers and Stoycheff's speakers were not silenced because someone could see them; they were silenced because they were watched by a power they could not watch back, under rules they could not contest. The pathology is the asymmetry, not the visibility. A society can be radically transparent and remain free if the transparency runs in every direction, including upward at power — what David Brin called the transparent society, and what we might call sousveillance: the watched watching the watchers (Brin 1998). The remedy the surviving objection points toward is therefore, once more, not for individuals to hide better. The quantum section told us they cannot, not for long. The remedy is to bind the watchers: oversight, retention limits, sunlight on the state, democratic control of the archive. Even the objection that survives points away from the locked drawer and toward the accountable institution.

## Conclusion: the wasting asset

Assemble the case. Privacy as popularly understood — the right to conceal — is historically contingent (it was switched on by the camera in 1890), legally defeasible by its own drafters (Article 8 hands the state a key in its second sentence), already surrendered for the most intimate facts of our lives to entities no one elected, and now, with Harvest Now, Decrypt Later, technologically doomed for anything that must stay secret across the years. Defending that — the fortress of personal secrecy — is, in the strict and unsentimental sense, a problematic distraction and a wasting asset: effort poured into a wall that physics is quietly dissolving on a schedule you cannot read.

What deserves defense is not the closed door. It is the accountable institution. Not the right to hide, but the right to be treated justly with everything that cannot, in the end, be hidden. The quantum century does not present us with a choice between surveillance and secrecy. It informs us that secrecy was always temporary — a bet against the future that the future is now positioned to collect — and it invites us, finally, to grow up about it. The energy the privacy movement spends teaching people to encrypt their diaries would be better spent forcing the state to publish its retention policies.

My original instinct, when I first wrote on this, was to spring a trap: to seduce you with the case against privacy and then reveal, in the last paragraph, that you should want your freedom after all. I no longer think that ending is honest. The part of you that wants to hide is not your freedom; it is your suspicion that freedom must be smuggled, kept in a drawer, behind a cipher, away from the light. In a world where nothing stays hidden — least of all from the machine already harvesting today's secrets for tomorrow's decryption — freedom will have to become something braver than a locked drawer. It will have to become a society we are not afraid to be seen in.

Build that, and privacy turns out to have been what it always quietly was: not a wall we needed, but a substitute for the accountability we never built. Replace the substitute with the real thing, and you will not miss it.

### References

Bentham, J. (1791). *Panopticon; or, the Inspection-House*. Thomas Byrne; T. Payne.

Brin, D. (1998). *The Transparent Society: Will Technology Force Us to Choose Between Privacy and Freedom?* Perseus Books.

Cohen, J. E. (2013). What Privacy Is For. *Harvard Law Review*, 126, 1904–1933.

Etzioni, A. (1999). *The Limits of Privacy*. Basic Books.

European Commission. (2025). *Coordinated Implementation Roadmap for the Transition to Post-Quantum Cryptography*.

European Convention on Human Rights. (1950). Articles 3 and 8. Council of Europe.

ETSI. (2015). *Quantum-Safe Cryptography and Security*. ETSI White Paper.

Foucault, M. (1977). *Discipline and Punish: The Birth of the Prison* (A. Sheridan, Trans.). Pantheon Books.

Gidney, C. (2025). *How to Factor 2048-bit RSA Integers with Less than a Million Noisy Qubits*. Google Quantum AI.

Greenwald, G. (2014). *No Place to Hide: Edward Snowden, the NSA, and the U.S. Surveillance State*. Metropolitan Books.

Mascelli, J., & Rodden, M. (2025). 'Harvest Now Decrypt Later': Examining Post-Quantum Cryptography and the Data Privacy Risks for Distributed Ledger Networks. *FEDS Working Paper 2025-093*. Board of Governors of the Federal Reserve System.

Mosca, M. (2018). Cybersecurity in an Era with Quantum Computers: Will We Be Ready? *IEEE Security & Privacy*, 16(5), 38–41.

Mosca, M., & Piani, M. (2024). *2024 Quantum Threat Timeline Report*. Global Risk Institute.

Nissenbaum, H. (2009). *Privacy in Context: Technology, Policy, and the Integrity of Social Life*. Stanford University Press.

NIST. (2024). *FIPS 203, FIPS 204, and FIPS 205: Post-Quantum Cryptography Standards*. National Institute of Standards and Technology.

NSA. (n.d.). *Commercial National Security Algorithm Suite 2.0 (CNSA 2.0)*. U.S. National Security Agency.

Penney, J. W. (2016). Chilling Effects: Online Surveillance and Wikipedia Use. *Berkeley Technology Law Journal*, 31(1), 117–182.

Posner, R. A. (1978). The Right of Privacy. *Georgia Law Review*, 12(3), 393–422.

Richards, N. M. (2013). The Dangers of Surveillance. *Harvard Law Review*, 126, 1934–1965.

Shor, P. W. (1994). Algorithms for Quantum Computation: Discrete Logarithms and Factoring. In *Proceedings of the 35th Annual Symposium on Foundations of Computer Science* (pp. 124–134). IEEE.

Solove, D. J. (2007). 'I've Got Nothing to Hide' and Other Misunderstandings of Privacy. *San Diego Law Review*, 44, 745–772.

Solove, D. J. (2008). *Understanding Privacy*. Harvard University Press.

Stoycheff, E. (2016). Under Surveillance: Examining Facebook's Spiral of Silence Effects in the Wake of NSA Internet Monitoring. *Journalism & Mass Communication Quarterly*, 93(2), 296–311.

Universal Declaration of Human Rights. (1948). Article 12. United Nations.

Warren, S. D., & Brandeis, L. D. (1890). The Right to Privacy. *Harvard Law Review*, 4(5), 193–220.

Westin, A. F. (1967). *Privacy and Freedom*. Atheneum.

Zuboff, S. (2019). *The Age of Surveillance Capitalism: The Fight for a Human Future at the New Frontier of Power*. PublicAffairs.
