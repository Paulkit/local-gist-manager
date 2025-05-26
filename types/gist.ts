export interface Gist {
  id: string;
  html_url: string;
  description: string;
  public: boolean;
  created_at: string;
  updated_at: string;
  files: {
    [key: string]: {
      filename: string;
      type: string;
      language: string;
      raw_url: string;
      size: number;
      content?: string;
    };
  };
}
