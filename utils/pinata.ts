"use server";
import axios, { AxiosResponse } from "axios";
const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjMmU2OGU4NC00YjIxLTRmMzItODhhOC1iODkyZDk2YjM0YWIiLCJlbWFpbCI6Im1yLnNoYWRvdzk0NjFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjY2NGE2ZTNiMDA0ZWRjM2U3MDczIiwic2NvcGVkS2V5U2VjcmV0IjoiYWIwMjk2MDMyOTAzNDhkZDZmNzI4ZDA4OGM0NjUyN2I5NWY4NGJlMTA3MjU5NTNjNmQzNTNlNzhlZTc2ZjZhZSIsImV4cCI6MTc3NDI5MjQ0N30.M81hUZoCkXT3Yng0Fse83lK-r8jTp37AgthyuLBCQiU";
//const jwt = process.env.JWT || process.env.NEXT_PUBLIC_JWT;
//console.log("JWT being used:", jwt ? "JWT is defined" : "JWT is undefined");

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

interface UploadResult {
  success: boolean;
  pinataURL?: string;
  message?: string;
}

export const uploadJSONToIPFS = async (JSONBody: any): Promise<UploadResult> => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  try {
    const res: AxiosResponse<PinataResponse> = await axios.post(url, JSONBody, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    return {
      success: true,
      pinataURL: "https://gateway.pinata.cloud/ipfs/" + res.data.IpfsHash,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const uploadFileToIPFS = async (data: FormData): Promise<UploadResult> => {
  const file = data.get("file") as File;
  if (!file) {
    return {
      success: false,
      message: "No file found in form data",
    };
  }

  data.delete('file');
  data.append('file', file, file.name);


  const pinataMetadata = JSON.stringify({
    name: file.name,
  });
  data.append("pinataMetadata", pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  data.append("pinataOptions", pinataOptions);

  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data,
      {
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": `multipart/form-data; boundary=${(data as any)._boundary}`,
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    return {
      success: true,
      pinataURL: "https://gateway.pinata.cloud/ipfs/" + res.data.IpfsHash,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Pinata API Error:", error.response.data);
    } else {
      console.error("Error:", error instanceof Error ? error.message : error);
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
