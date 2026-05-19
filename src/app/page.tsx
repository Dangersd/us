import Button from "~components/ui/Button";
import Card from "~components/ui/Card";

const PreviewPage = () => (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 p-6">
        <header className="flex flex-col gap-2">
            <h1 className="font-display text-3xl font-medium">us</h1>
            <p className="text-ink-secondary text-base">
                Phase 0.2 — каркас. Кнопки и карточки готовы.
            </p>
        </header>

        <Card>
            <div className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold">Button — варианты</h2>
                <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary</Button>
                    <Button variant="soft">Soft</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger-soft">Danger</Button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">sm</Button>
                    <Button size="md">md</Button>
                    <Button size="lg">lg</Button>
                    <Button size="xl">xl</Button>
                    <Button size="pill">pill</Button>
                </div>
            </div>
        </Card>

        <Card variant="hero">
            <h2 className="font-display text-2xl font-medium">Hero card</h2>
            <p className="text-ink-secondary mt-2 text-base">
                Тёплое off-white на тёмном фоне. Glass с blur 24px и тёплой
                границей.
            </p>
        </Card>

        <Card variant="compact">
            <p className="text-ink-muted text-sm">
                Compact card — для list items в комнатах.
            </p>
        </Card>
    </main>
);

export default PreviewPage;
