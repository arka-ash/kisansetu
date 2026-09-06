import { BuyerMatchResult, BuyerProfile, QualityGrade } from '../types';
import { calculateDistanceKm, calculateTransportCost, isGradeCompatible } from '../data/seedData';

export interface MatchingParams {
  cropName: string;
  quantityKg: number;
  qualityGrade: QualityGrade;
  farmerCoordinates?: { lat: number; lng: number } | null;
  farmerLocation?: string;
  buyersList: BuyerProfile[];
}

export function matchAndRankBuyers({
  cropName,
  quantityKg,
  qualityGrade,
  farmerCoordinates,
  farmerLocation,
  buyersList,
}: MatchingParams): BuyerMatchResult[] {
  const hasValidCoords =
    Boolean(farmerCoordinates) &&
    Number.isFinite(Number(farmerCoordinates?.lat)) &&
    Number.isFinite(Number(farmerCoordinates?.lng)) &&
    Number(farmerCoordinates?.lat) >= -90 &&
    Number(farmerCoordinates?.lat) <= 90 &&
    Number(farmerCoordinates?.lng) >= -180 &&
    Number(farmerCoordinates?.lng) <= 180;

  // 1. Filter compatible buyers
  const compatibleMatches: Array<{
    buyer: BuyerProfile;
    cropReq: BuyerProfile['cropsPurchased'][0];
    distanceKm: number;
    pricePerKg: number;
    grossRevenue: number;
    transportCost: number;
    netReturn: number;
    transportDetails: ReturnType<typeof calculateTransportCost>;
  }> = [];

  for (const buyer of buyersList) {
    const cropReq = buyer.cropsPurchased.find(
      (c) => c.cropName.toLowerCase() === cropName.toLowerCase()
    );

    if (cropReq && isGradeCompatible(qualityGrade, cropReq.minGrade)) {
      const distanceKm = hasValidCoords && farmerCoordinates
        ? calculateDistanceKm(
            Number(farmerCoordinates.lat),
            Number(farmerCoordinates.lng),
            buyer.coordinates.lat,
            buyer.coordinates.lng
          )
        : 0;

      const grossRevenue = quantityKg * cropReq.pricePerKg;
      const transportDetails = calculateTransportCost(distanceKm, quantityKg);
      const netReturn = grossRevenue - transportDetails.cost;

      compatibleMatches.push({
        buyer,
        cropReq,
        distanceKm,
        pricePerKg: cropReq.pricePerKg,
        grossRevenue,
        transportCost: transportDetails.cost,
        netReturn,
        transportDetails,
      });
    }
  }

  if (compatibleMatches.length === 0) {
    return [];
  }

  // 2. Compute normalizations for transparent scoring
  const maxPrice = Math.max(...compatibleMatches.map((m) => m.pricePerKg));
  const maxDistance = Math.max(...compatibleMatches.map((m) => m.distanceKm), 1);
  const maxNetReturn = Math.max(...compatibleMatches.map((m) => m.netReturn), 1);

  const scoredMatches: BuyerMatchResult[] = compatibleMatches.map((item) => {
    const priceScore = maxPrice > 0 ? (item.pricePerKg / maxPrice) * 100 : 50;
    const distanceScore = hasValidCoords
      ? Math.max(10, (1 - item.distanceKm / (maxDistance * 1.1)) * 100)
      : 50;
    
    let demandScore = 40;
    if (item.cropReq.demandLevel === 'HIGH') demandScore = 100;
    else if (item.cropReq.demandLevel === 'MEDIUM') demandScore = 70;

    const netReturnScore = maxNetReturn > 0 ? Math.max(0, (item.netReturn / maxNetReturn) * 100) : 50;

    // 40% Price + 20% Demand + 20% Distance + 20% Net Return
    const overallScore = Math.round(
      0.4 * priceScore + 0.2 * demandScore + 0.2 * distanceScore + 0.2 * netReturnScore
    );

    return {
      buyer: item.buyer,
      cropRequirement: item.cropReq,
      distanceKm: item.distanceKm,
      pricePerKg: item.pricePerKg,
      grossRevenue: item.grossRevenue,
      transportCost: item.transportCost,
      netReturn: item.netReturn,
      priceScore: Math.round(priceScore),
      distanceScore: Math.round(distanceScore),
      demandScore,
      overallScore,
      isRecommended: false,
      recommendationReasons: [],
      transportDetails: item.transportDetails,
    };
  });

  // 3. Sort by Net Return primarily, then Overall Score
  scoredMatches.sort((a, b) => {
    if (b.netReturn !== a.netReturn) {
      return b.netReturn - a.netReturn;
    }
    return b.overallScore - a.overallScore;
  });

  // 4. Mark top recommended and build reasons
  if (scoredMatches.length > 0) {
    const top = scoredMatches[0];
    top.isRecommended = true;

    const reasons: string[] = [];
    reasons.push(`Highest net return of ₹${top.netReturn.toLocaleString('en-IN')} after all transport expenses`);
    
    if (top.cropRequirement.demandLevel === 'HIGH') {
      reasons.push(`High procurement demand with potential for faster buyer response`);
    }
    
    if (hasValidCoords) {
      if (top.distanceKm <= 50) {
        reasons.push(`Close transit radius (${top.distanceKm} km) minimizing spoilage & travel time`);
      } else {
        reasons.push(`Competitive rate of ₹${top.pricePerKg}/kg easily compensates for ${top.distanceKm} km transit`);
      }
    } else {
      reasons.push(`Transport freight calculated at standard baseline rate (enable GPS for live distance)`);
    }

    reasons.push(`Fully accepts ${qualityGrade} quality grade (${top.cropRequirement.minGrade} requirement met)`);
    
    if (top.buyer.paymentTerms) {
      reasons.push(`Payment Terms: ${top.buyer.paymentTerms}`);
    }

    top.recommendationReasons = reasons;

    // Provide reasons for secondary options as well
    for (let i = 1; i < scoredMatches.length; i++) {
      const match = scoredMatches[i];
      const otherReasons: string[] = [];
      if (hasValidCoords && match.distanceKm < top.distanceKm) {
        otherReasons.push(`Shorter distance (${match.distanceKm} km vs ${top.distanceKm} km)`);
      }
      otherReasons.push(`Offers ₹${match.pricePerKg}/kg (${match.cropRequirement.demandLevel} Demand)`);
      match.recommendationReasons = otherReasons;
    }
  }

  return scoredMatches;
}
