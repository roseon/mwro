import { petTemplates } from '../../../Data/PetTemplates';
import { NpcPackets } from '../../../Responses/NpcPackets';
import { GameActionParser } from '../../GameActionParser';
import type { ActionTemplateCallback } from '../ActionTemplateExecutable';
import type { GameAction } from '../../GameActionTypes';

// Custom prices for each pet
const petPrices: Record<string, number> = {
	antEater: 50000,
	aquarius: 600000000,
	auroraLion: 10000000,
	axewalker: 50000,
	bee: 50000,
	berserker: 50000000,
	bigCrab: 250000,
	bigFoot: 250000,
	bloodpede: 10000,
	bogNightmare: 35000,
	capilla: 150000,
	capricornus: 80000000,
	centaurKing: 70000000,
	chaosDevil: 150000000,
	chaosWisp: 40050000,
	chaoticDevil: 10000000,
	chinchillaFire: 20000000,
	chinchillaIce: 20000000,
	crazyBandit: 15000,
	cyclops: 6000000,
	darkDream: 70000000,
	darkGiant: 50000,
	demonDragon: 12000000,
	demonPunisher: 26050000,
	desertBandit: 25000,
	dreamDragon: 980000000,
	dreamFlyer: 980000000,
	earthWolf: 23000,
	evilFireDemon: 11260000,
	evilMudraper: 11260000,
	evilSkeletal: 11260000,
	evilWolf: 11260000,
	eyekicker: 500000,
	felsworn: 350000,
	feralWolf: 10000000,
	fireDemon: 120000,
	flamePhoenix: 920000000,
	flyer: 50000,
	fogSpirit: 5250000,
	ghastlyDragon: 185000000,
	ghostWarrior: 125000,
	ghoul: 8000000,
	ghoulspirit: 12000000,
	giantslicer: 125000,
	glimmerFish: 25000,
	glitterTiger: 920000000,
	greaterWolf: 550000,
	guard: 2300000,
	hellCat: 240000,
	hellGardener: 15000000,
	hellPhoenix: 350000,
	hellProtector: 25050000,
	holyDragon: 200000000,
	howlingBeast: 220050000,
	iceDemon: 2550000,
	killerBee: 1350000,
	leopardWolf: 5550000,
	lizardBandit: 500000,
	lizardMan: 500000,
	lizardMiner: 500000,
	lycosa: 350000,
	madOrgewalker: 24500000,
	mosquito: 320000,
	mudraper: 320000,
	mummy: 4250000,
	nepenthes: 50000,
	oceanLoong: 920000000,
	orgewalker: 10000000,
	phoenix: 250000,
	pisces: 600000000,
	riverBeast: 55000000,
	riverGuardian: 26000000,
	sandGiant: 50000000,
	santaClaus: 400000000,
	santaPrincess: 400000000,
	scarecrow: 50000,
	skeletal: 50000,
	snakeDemon: 550000,
	snowBear: 400000000,
	snowWolf: 5000000,
	snowie: 400000000,
	spiritCat: 50000,
	stoneGhost: 45500000,
	stoneGiant: 45500000,
	stoneTortoise: 980000000,
	teethor: 50000,
	thornSpider: 50000,
	treeDemon: 50000,
	werewolf: 50000,
	wickedSpirit: 50000,
	witheredGuard: 560000,
};

/**
 * Template for adding test pets to player.
 * Displays a paginated list of all available pets.
 */
export const addPets: ActionTemplateCallback = ({ client, player }, params) => {
	const page = typeof params?.page === 'number' ? params.page : 0;
	const pageSize = 10; // Reduced to fit navigation buttons
	const petKeys = Object.keys(petTemplates);
	const totalPets = petKeys.length;
	const totalPages = Math.ceil(totalPets / pageSize);
	
	// Ensure page is valid
	const safePage = Math.max(0, Math.min(page, totalPages - 1));
	
	const currentKeys = petKeys.slice(safePage * pageSize, (safePage + 1) * pageSize);

	const options: { text: string; action: GameAction }[] = currentKeys.map(key => {
		const pet = petTemplates[key];
		const price = petPrices[key] ?? 50000; // Default to 50000 if not specified
		
		return {
			text: `#G${pet.name}#E`,
			action: {
				type: 'npcSay',
				message: `Do you want to purchase #G${pet.name}#E for #y${price} gold#e?`,
				options: [
					{
						text: '#GConfirm#E',
						action: {
							type: 'npcSay',
							message: `You don't have enough gold! You need ${price} gold.`,
							condition: {
								type: 'gold',
								amount: price,
								not: true
							},
							else: {
								type: 'array',
								actions: [
									{
										type: 'gold',
										amount: -price,
									},
									{
										type: 'addPet',
										pet: key
									},
									{
										type: 'npcSay',
										message: `You bought a #G${pet.name}#E for ${price} gold!`
									}
								]
							}
						}
					},
					{
						text: '#YCancel#E',
						action: { type: 'noop' }
					}
				]
			}
		};
	});

	// Pagination controls
	if (safePage < totalPages - 1) {
		options.push({
			text: '#YNext Page#E',
			action: {
				type: 'template',
				template: 'addPets',
				params: { page: safePage + 1 }
			}
		});
	}

	if (safePage > 0) {
		options.push({
			text: '#YPrevious Page#E',
			action: {
				type: 'template',
				template: 'addPets',
				params: { page: safePage - 1 }
			}
		});
	}

	// Always add a close button
	options.push({
		text: '#YClose#E',
		action: { type: 'noop' }
	});

	// Parse actions
	const executables = options.map(opt => GameActionParser.parse(opt.action));
	
	// Create option text string for packet (text joined by &)
	// NpcPackets.dialogWithOptions expects "message\0Option1&Option2&Option3"
	// NpcSayOptionsExecutable joins options with '&' manually, so we mimic that
	const optionString = options.map(opt => opt.text).join('&');
	const message = `Select a pet to add (Page ${safePage + 1}/${totalPages}):\nTotal: ${totalPets}`;
	
	player.memory.npcOptions = executables;
	client.write(NpcPackets.dialogWithOptions(`${message}\0${optionString}`));
};


















