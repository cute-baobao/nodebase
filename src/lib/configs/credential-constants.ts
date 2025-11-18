import { CredentialTypeValues } from "@/db";

export const credentialTypeOptions = [
  {
    value: CredentialTypeValues[0],
    label: "Openai",
    logo: "/logos/openai.svg",
  },
  {
    value: CredentialTypeValues[1],
    label: "Gemini",
    logo: "/logos/gemini.svg",
  },
  {
    value: CredentialTypeValues[2],
    label: "Deepseek",
    logo: "/logos/deepseek.svg",
  },
  {
    value: CredentialTypeValues[3],
    label: "Resend",
    logo: "/logos/resend.svg",
  }
];

export const getCredentialLogo = (type: string) => {
  const credential = credentialTypeOptions.find(
    (credential) => credential.value === type,
  );
  return credential ? credential.logo : "/logos/logo.svg";
};
