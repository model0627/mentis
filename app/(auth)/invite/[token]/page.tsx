"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAcceptInvitation } from "@/hooks/use-members";
import { Button } from "@/components/ui/button";
import { Check, Loader2, XCircle } from "lucide-react";

export default function InvitePage() {
    const { token } = useParams<{ token: string }>();
    const { data: session, status } = useSession();
    const router = useRouter();
    const acceptInvitation = useAcceptInvitation();
    const [state, setState] = useState<"loading" | "ready" | "success" | "error">("loading");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (status === "loading") return;

        if (!session?.user) {
            // Redirect to login with callback to this page
            router.push(`/login?callbackUrl=/invite/${token}`);
            return;
        }

        setState("ready");
    }, [session, status, router, token]);

    const handleAccept = async () => {
        setState("loading");
        try {
            await acceptInvitation.mutateAsync(token);
            setState("success");
            setTimeout(() => router.push("/documents"), 2000);
        } catch (err: any) {
            setState("error");
            setErrorMsg(err.message || "초대를 수락할 수 없습니다.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center gap-6 max-w-md mx-auto text-center">
            <div className="h-12 w-12 rounded-r2 bg-brand flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
            </div>

            {state === "loading" && (
                <>
                    <h1 className="text-xl font-semibold text-foreground">초대 확인 중...</h1>
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </>
            )}

            {state === "ready" && (
                <>
                    <h1 className="text-xl font-semibold text-foreground">워크스페이스 초대</h1>
                    <p className="text-muted-foreground text-sm">
                        워크스페이스에 초대되었습니다. 아래 버튼을 클릭하여 수락하세요.
                    </p>
                    <Button onClick={handleAccept} className="bg-brand hover:bg-brand/90 text-white">
                        초대 수락
                    </Button>
                </>
            )}

            {state === "success" && (
                <>
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Check className="h-6 w-6 text-green-600" />
                    </div>
                    <h1 className="text-xl font-semibold text-foreground">초대를 수락했습니다</h1>
                    <p className="text-muted-foreground text-sm">잠시 후 이동합니다...</p>
                </>
            )}

            {state === "error" && (
                <>
                    <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <h1 className="text-xl font-semibold text-foreground">초대 수락 실패</h1>
                    <p className="text-muted-foreground text-sm">{errorMsg}</p>
                    <Button variant="outline" onClick={() => router.push("/documents")}>
                        홈으로 이동
                    </Button>
                </>
            )}
        </div>
    );
}
