"use client";

import { useEffect, useState } from "react";
import { useAuthConfig, useUpsertAuthConfig } from "~/hooks/use-auth-config";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

interface EndpointAuthFormProps {
    endpointId: string;
    onSuccess?: () => void;
}

type AuthType = "none" | "login" | "protected";

export function EndpointAuthForm({ endpointId, onSuccess }: EndpointAuthFormProps) {
    const { data: config, isLoading } = useAuthConfig(endpointId);
    const upsertConfig = useUpsertAuthConfig();

    const [authType, setAuthType] = useState<AuthType>("none");
    const [tokenExpirySeconds, setTokenExpirySeconds] = useState<number>(3600);

    useEffect(() => {
        if (config) {
            if (config.isLoginEndpoint) {
                setAuthType("login");
            } else if (config.requiresAuth) {
                setAuthType("protected");
            } else {
                setAuthType("none");
            }
            setTokenExpirySeconds(config.tokenExpirySeconds ?? 3600);
        } else {
            setAuthType("none");
            setTokenExpirySeconds(3600);
        }
    }, [config]);

    const handleSave = () => {
        const isLoginEndpoint = authType === "login";
        const requiresAuth = authType === "protected";

        upsertConfig.mutate(
            {
                endpointId,
                isLoginEndpoint,
                requiresAuth,
                tokenExpirySeconds: isLoginEndpoint ? Math.max(1, tokenExpirySeconds) : 3600,
            },
            {
                onSuccess: () => {
                    if (onSuccess) onSuccess();
                },
            },
        );
    };

    if (isLoading) {
        return (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                Loading authentication settings...
            </div>
        );
    }

    return (
        <Card className="border-none py-6 px-4 shadow-none gap-6 rounded-none h-full">
            <CardHeader className="gap-1 px-0">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Authentication
                </CardTitle>
                <CardDescription className="font-mono text-xs">
                    Configure JWT authentication behavior for this endpoint.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 px-0">
                {/* Auth type options */}
                <div className="grid gap-3">
                    <div
                        onClick={() => setAuthType("none")}
                        className={`group relative flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-all ${
                            authType === "none"
                                ? "border-primary/50 bg-muted/50"
                                : "border-border hover:bg-muted/30"
                        }`}
                    >
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <Label className="cursor-pointer font-semibold text-sm">
                                    None (Public)
                                </Label>
                                {authType === "none" && (
                                    <span className="text-xs text-primary font-medium">Active</span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Anyone can request mock data without providing credentials.
                            </p>
                        </div>
                    </div>

                    <div
                        onClick={() => setAuthType("login")}
                        className={`group relative flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-all ${
                            authType === "login"
                                ? "border-amber-500/50 bg-muted/50"
                                : "border-border hover:bg-muted/30"
                        }`}
                    >
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <Label className="cursor-pointer font-semibold text-sm">
                                    Login Endpoint
                                </Label>
                                {authType === "login" && (
                                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                        Active
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Issues a signed JWT token along with mock data when invoked.
                            </p>
                        </div>
                    </div>

                    <div
                        onClick={() => setAuthType("protected")}
                        className={`group relative flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-all ${
                            authType === "protected"
                                ? "border-emerald-500/50 bg-muted/50"
                                : "border-border hover:bg-muted/30"
                        }`}
                    >
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <Label className="cursor-pointer font-semibold text-sm">
                                    Requires Authentication
                                </Label>
                                {authType === "protected" && (
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                        Active
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Protects mock data. Requires a valid{" "}
                                <code className="font-mono">
                                    Authorization: Bearer &lt;token&gt;
                                </code>{" "}
                                header.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Token expiry config for login endpoint */}
                {authType === "login" && (
                    <>
                        <Separator />
                        <div className="space-y-2">
                            <Label
                                htmlFor="token-expiry"
                                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                            >
                                Token Expiry
                            </Label>
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <Input
                                        id="token-expiry"
                                        type="number"
                                        min={1}
                                        value={tokenExpirySeconds}
                                        onChange={(e) =>
                                            setTokenExpirySeconds(Number(e.target.value))
                                        }
                                        className="font-mono text-sm pr-10 bg-muted border-0 shadow-none"
                                        placeholder="3600"
                                    />
                                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                                        sec
                                    </span>
                                </div>

                                <div className="flex gap-1.5">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setTokenExpirySeconds(3600)}
                                        className="h-9 text-xs font-mono"
                                    >
                                        1h
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setTokenExpirySeconds(86400)}
                                        className="h-9 text-xs font-mono"
                                    >
                                        24h
                                    </Button>
                                </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                JWT tokens generated by this endpoint will expire after this
                                duration. Default: 3600s (1 hour).
                            </p>
                        </div>
                    </>
                )}
            </CardContent>

            <div className="flex justify-end pt-2">
                <Button
                    onClick={handleSave}
                    disabled={upsertConfig.isPending}
                    className="h-10 gap-2 font-semibold text-primary-foreground"
                >
                    {upsertConfig.isPending ? "Saving..." : "Save"}
                </Button>
            </div>
        </Card>
    );
}
