import { StatusCode } from "hono/utils/http-status";
import { supabase } from "../../lib/supabase.js";
import { CustomError } from "../../utils/error.js";
import { logger } from "../../utils/logger.js";

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

  async send(notification: { userId: string; title: string; content?: string; link?: string; type: string }) {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: notification.userId,
        title: notification.title,
        content: notification.content,
        link: notification.link,
        type: notification.type,
      })
      .select()
      .single();

    if (error) {
      throw new CustomError({
        title: "Error sending notification",
        detail: error.message,
        status: 500,
      });
    }

    const { data: tokens, error: errorTokens } = await supabase
      .from("users_notification_devices")
      .select("*")
      .eq("user_id", notification.userId);

    if (errorTokens) {
      throw new CustomError({
        title: "Error sending notification",
        detail: errorTokens.message,
        status: 500,
      });
    }

    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        tokens.map((t) => ({
          to: t.token,
          title: notification.title,
          body: notification.content,
          channelId: "default",
        }))
      ),
    });

    if (!res.ok) {
      throw new CustomError({
        title: "Error sending notification",
        detail: res.statusText,
        status: res.status as StatusCode,
      });
    }

    return data.id;
  }

  async uploadUserToken(userId: string, token: string) {
    const { data: exists } = await supabase.from("users_notification_devices").select("*").eq("token", token);

    if (exists && exists.length > 0) {
      return;
    }

    const { error } = await supabase
      .from("users_notification_devices")
      .insert({ user_id: userId, token })
      .select()
      .single();

    if (error) {
      throw new CustomError({
        title: "Error uploading user token",
        detail: error.message,
        status: 500,
      });
    }
  }

  async deleteUserToken(userId: string, token: string) {
    await supabase.from("users_notification_devices").delete().eq("user_id", userId).eq("token", token);
  }
}
