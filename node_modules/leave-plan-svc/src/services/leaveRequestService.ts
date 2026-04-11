import axios from "axios";


  export async function createDraft(input: {
    employee_number: string;
    leave_type_key: string;
    start_date: string;
    end_date: string;
    reason?: string | null;
    source_plan_id: number;
  }): Promise<{ id: number }> {
    const res = await axios.post(
      `${process.env.LEAVE_REQUEST_SVC_URL}/internal/leave-requests/draft`,
      input,
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY!,
        },
      },
    );
      return { id: res.data.id };
  }

