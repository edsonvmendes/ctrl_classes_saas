import { createClient } from "@supabase/supabase-js";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function createAdminClient() {
  return createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function getTestPartnerId() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const email = requireEnv("E2E_TEST_EMAIL");
  const password = requireEnv("E2E_TEST_PASSWORD");
  const client = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Unable to authenticate E2E test user.");
  }

  const admin = createAdminClient();
  const { data: partner, error: partnerError } = await admin
    .from("partners")
    .select("partner_id")
    .eq("user_id", data.user.id)
    .single();

  await client.auth.signOut();

  if (partnerError || !partner) {
    throw new Error(partnerError?.message ?? "Unable to resolve E2E partner.");
  }

  return partner.partner_id as string;
}

async function collectIdsByPrefix(partnerId: string) {
  const admin = createAdminClient();
  const [studentsResult, schedulesResult, titledClassesResult] = await Promise.all([
    admin
      .from("students")
      .select("id")
      .eq("partner_id", partnerId)
      .ilike("full_name", "E2E %"),
    admin
      .from("schedules")
      .select("id")
      .eq("partner_id", partnerId)
      .ilike("title", "E2E %"),
    admin
      .from("classes")
      .select("id")
      .eq("partner_id", partnerId)
      .ilike("title", "E2E %"),
  ]);

  if (studentsResult.error) {
    throw new Error(studentsResult.error.message);
  }

  if (schedulesResult.error) {
    throw new Error(schedulesResult.error.message);
  }

  if (titledClassesResult.error) {
    throw new Error(titledClassesResult.error.message);
  }

  const studentIds = (studentsResult.data ?? []).map((item) => item.id as string);
  const scheduleIds = (schedulesResult.data ?? []).map((item) => item.id as string);
  const classIds = new Set((titledClassesResult.data ?? []).map((item) => item.id as string));

  if (studentIds.length > 0) {
    const { data, error } = await admin
      .from("classes")
      .select("id")
      .eq("partner_id", partnerId)
      .in("student_id", studentIds);

    if (error) {
      throw new Error(error.message);
    }

    for (const item of data ?? []) {
      classIds.add(item.id as string);
    }
  }

  if (scheduleIds.length > 0) {
    const { data, error } = await admin
      .from("classes")
      .select("id")
      .eq("partner_id", partnerId)
      .in("schedule_id", scheduleIds);

    if (error) {
      throw new Error(error.message);
    }

    for (const item of data ?? []) {
      classIds.add(item.id as string);
    }
  }

  return {
    classIds: Array.from(classIds),
    scheduleIds,
    studentIds,
  };
}

export async function cleanupE2EData() {
  const partnerId = await getTestPartnerId();
  const admin = createAdminClient();
  const { classIds, scheduleIds, studentIds } = await collectIdsByPrefix(partnerId);

  if (classIds.length > 0) {
    const { error: attendanceError } = await admin
      .from("attendance")
      .delete()
      .eq("partner_id", partnerId)
      .in("class_id", classIds);

    if (attendanceError) {
      throw new Error(attendanceError.message);
    }
  }

  if (studentIds.length > 0) {
    const { error: paymentByStudentError } = await admin
      .from("payments")
      .delete()
      .eq("partner_id", partnerId)
      .in("student_id", studentIds);

    if (paymentByStudentError) {
      throw new Error(paymentByStudentError.message);
    }
  }

  if (classIds.length > 0) {
    const { error: paymentByClassError } = await admin
      .from("payments")
      .delete()
      .eq("partner_id", partnerId)
      .in("class_id", classIds);

    if (paymentByClassError) {
      throw new Error(paymentByClassError.message);
    }

    const { error: classesError } = await admin
      .from("classes")
      .delete()
      .eq("partner_id", partnerId)
      .in("id", classIds);

    if (classesError) {
      throw new Error(classesError.message);
    }
  }

  if (scheduleIds.length > 0) {
    const { error: schedulesError } = await admin
      .from("schedules")
      .delete()
      .eq("partner_id", partnerId)
      .in("id", scheduleIds);

    if (schedulesError) {
      throw new Error(schedulesError.message);
    }
  }

  if (studentIds.length > 0) {
    const { error: studentsError } = await admin
      .from("students")
      .delete()
      .eq("partner_id", partnerId)
      .in("id", studentIds);

    if (studentsError) {
      throw new Error(studentsError.message);
    }
  }
}
