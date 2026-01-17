import { http, HttpResponse } from "msw";

export const handlers = [
    // Mock Cloudinary upload
    http.post("https://api.cloudinary.com/v1_1/*/image/upload", () => {
        return HttpResponse.json({
            secure_url: "https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg",
            public_id: "sample",
        });
    }),

    // Example mock for external API
    // http.get('https://api.example.com/data', () => {
    //   return HttpResponse.json({ data: 'mocked data' })
    // }),
];
