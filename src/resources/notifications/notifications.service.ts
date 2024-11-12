import { supabase } from "../../lib/supabase.js";
import { CustomError } from "../../utils/error.js";

export class NotificationsService {
  async getByUserId(userId: string) {
    const { data, error } = await supabase.from("notifications").select("*").eq("user_id", userId);
    if (error) {
      throw new CustomError({
        title: "Error fetching notifications",
        detail: error.message,
        status: 500,
      });
    }

    return data;
  }

  async send(userId: string, notification: { title: string; content?: string; link?: string }) {
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      title: notification.title,
      content: notification.content,
      link: notification.link,
    });

    // TODO: Send notification to user
  }
}
