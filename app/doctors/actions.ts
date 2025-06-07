"use server"

import { gql } from "graphql-request"
import {fetchGraphQL} from "@/lib/graphql-client";

function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const FILTER_DOCTORS = gql`query MyQuery($where: DoctorsWhereInput!) {
  findManyDoctors(where: $where) {
    bio
    education
    experience
    first_name
    id
    is_license_verified
    languages
    last_name
    profile_image
    specialty
    users {
      address
      email
      phone
    }
  }
}`

export async function getDoctorsWithLocation(param: {
  specialty: string | undefined;
  search: string | undefined;
  lng: number | undefined;
  radius: number | undefined;
  lat: number | undefined
}) {
  const {data:doctors} = await fetchGraphQL<any>(FILTER_DOCTORS,
      {
        where: {
          ...(param.specialty && { specialty: { equals: param.specialty } }),
          // OR: param.search
          //     ? [
          //       { first_name: { contains: param.search, mode: 'insensitive' } },
          //       { last_name: { contains: param.search, mode: 'insensitive' } },
          //     ]
          //     : undefined,
        },
      }
  );
  console.log('these are the doctors',doctors.findManyDoctors);
    if (!doctors || !doctors.findManyDoctors) {
      return [];
    }
  const filteredDoctors = (
      await Promise.all(
          doctors.findManyDoctors.map(async (doctor: any) => {
            if (!doctor.users || !doctor.users.address) return null;

            const address = doctor.users.address;
            const { latitude: lat, longitude: lng } = await geocodeAddress(address);

            if (param.lat && param.lng && param.radius) {
              const distance = getDistanceInKm(param.lat, param.lng, lat, lng);
              console.log('this is the distance of doctor',doctor.first_name, distance);
              return distance <= param.radius ? doctor : null;
            }
            return doctor;
          })
      )
  ).filter((doctor) => doctor !== null);
  console.log("these are the filtered doctors",filteredDoctors);
  const transformedDoctors = filteredDoctors.map(async (doctor: any) => {
    const {latitude, longitude} = await geocodeAddress(doctor.users?.address || '');
    console.log('this is the doctor lat and lng', latitude, longitude);
    return ({
      id: doctor.id,
      name: `${doctor.first_name} ${doctor.last_name}`,
      specialty: doctor.specialty,
      title: doctor.users?.address || 'Unknown',
      bio: doctor.bio,
      education: doctor.education,
      experience: doctor.experience,
      profileImage: doctor.profile_image,
      languages: doctor.languages,
      isLicenseVerified: doctor.is_license_verified,
      location: {
        address: doctor.users?.address,
        latitude,
        longitude,
      }
    })
  });
  console.log('these are the transformed doctors', transformedDoctors);
  const result =await Promise.all(transformedDoctors);
  console.log('this is the result', result);
    return result;
}
export async function geocodeAddress(address: string) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'MediSys/1.0' // Required by Nominatim
    },
    next: { revalidate: 0 } // optional: disables caching for fetch
  });

  if (!response.ok) {
    throw new Error('Geocoding API request failed');
  }

  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error('No results found');
  }

  const { lat, lon } = data[0];

  return {
    latitude: parseFloat(lat),
    longitude: parseFloat(lon)
  };
}


