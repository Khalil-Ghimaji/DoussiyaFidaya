import { FC } from "react";
import { fetchGraphQL } from "@/lib/graphql-client";
import ConsultationForm from "./consultation-form";

interface Patient {
  id: string;
  users: {
    first_name: string;
    last_name: string;
  };
}

async function fetchPatients() {
  try {
    const result = await fetchGraphQL(
      `
        query FindManyPatients {
          findManyPatients {
            id
            users {
              first_name
              last_name
            }
          }
        }
      `
    );
    console.log("this is the result",result)
    return result.data.findManyPatients || [];
  } catch (error) {
    console.error("Error fetching patients:", error);
    return [];
  }
}

const QuickConsultationPage: FC = async () => {
  const patients: Patient[] = await fetchPatients();
  console.log("this is the patients",patients)

  return <ConsultationForm patients={patients} />;
};

export default QuickConsultationPage;