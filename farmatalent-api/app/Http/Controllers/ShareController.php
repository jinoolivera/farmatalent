<?php

namespace App\Http\Controllers;

use App\Models\ShiftRequest;
use Illuminate\Contracts\View\Factory as ViewFactory;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\View\View;
use Symfony\Component\HttpFoundation\Response;

class ShareController extends Controller
{
    public function __construct(
        private readonly ViewFactory $viewFactory,
    ) {
    }

    public function turno(int $id): View
    {
        $shift = ShiftRequest::with('company')->findOrFail($id);

        $typeLabels = [
            'pharmacist' => 'Químico farmacéutico',
            'pharmacy_technician' => 'Técnico en farmacia',
            'doctor' => 'Doctor',
            'assistant' => 'Auxiliar / apoyo',
            'nurse' => 'Enfermero/a',
            'intern' => 'Practicante',
        ];

        $companyName = $shift->company?->name ?? 'una farmacia';
        $typeLabel = $typeLabels[$shift->professional_type] ?? 'profesional de salud';
        $location = $shift->location;
        $time = trim(sprintf('%s%s', substr((string) $shift->starts_at, 0, 5), $shift->ends_at ? '–' . substr((string) $shift->ends_at, 0, 5) : ''));

        $title = $shift->title ?: "Turno de {$typeLabel} · {$companyName}";

        $descriptionParts = array_filter([
            "Se busca {$typeLabel} en {$companyName}",
            $location,
            $time ?: null,
            $shift->shift_date?->format('Y-m-d'),
        ]);
        $description = implode(' · ', $descriptionParts) . '. Postula gratis en FarmaTalent.';

        $frontendUrl = rtrim(config('app.frontend_url'), '/');
        $appUrl = rtrim(config('app.url'), '/');

        return view('share.turno', [
            'title' => $title,
            'description' => $description,
            'image' => $this->shareImageUrl($shift, $appUrl),
            'shareUrl' => $appUrl . '/compartir/turno/' . $id,
            'redirectUrl' => $frontendUrl . '/app/turnos/' . $id,
        ]);
    }

    public function turnoImage(int $id): Response
    {
        $shift = ShiftRequest::with('company')->findOrFail($id);
        $payload = $this->buildShareImagePayload($shift);
        $cacheRelativePath = 'og/turnos/turno-' . $shift->id . '-' . $this->shareImageVersion($shift) . '.png';

        if (! Storage::disk('public')->exists($cacheRelativePath)) {
            try {
                $this->renderShareImagePng($payload, $cacheRelativePath);
            } catch (\Throwable $exception) {
                if (! app()->environment('testing')) {
                    try {
                        Log::warning('No se pudo generar la imagen OG PNG del turno.', [
                            'shift_id' => $shift->id,
                            'error' => $exception->getMessage(),
                        ]);
                    } catch (\Throwable) {
                        // Si logging falla por permisos u otro problema de infraestructura,
                        // no debemos bloquear el fallback del share.
                    }
                }
            }
        }

        if (Storage::disk('public')->exists($cacheRelativePath)) {
            return response(Storage::disk('public')->get($cacheRelativePath), 200, [
                'Content-Type' => 'image/png',
                'Cache-Control' => 'public, max-age=3600',
            ]);
        }

        return response()->file(public_path('images/og-share.png'), [
            'Content-Type' => 'image/png',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    public function turnoImageSvg(int $id): Response
    {
        $shift = ShiftRequest::with('company')->findOrFail($id);
        $payload = $this->buildShareImagePayload($shift);

        return response($this->renderShareImageSvg($payload), 200, [
            'Content-Type' => 'image/svg+xml; charset=UTF-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    private function buildShareImagePayload(ShiftRequest $shift): array
    {
        $company = $shift->company;

        $title = $this->wrapText(
            $shift->title ?: $this->professionalLabel($shift->professional_type),
            25,
            2,
        );

        $companyName = $this->wrapText($company?->name ?? 'FarmaTalent', 28, 2);
        $location = $this->truncateText($shift->location ?: ($company?->address ?? 'Ubicacion por confirmar'), 34);
        $schedule = $this->truncateText($this->buildScheduleLabel($shift), 30);
        $date = $shift->shift_date?->format('d/m/Y') ?? 'Fecha por confirmar';
        $tagline = $shift->coordinacion_chat
            ? 'Coordinacion por chat despues del match'
            : 'Postula gratis en FarmaTalent';

        return [
            'titleLines' => $title,
            'companyLines' => $companyName,
            'location' => $location,
            'schedule' => $schedule,
            'date' => $date,
            'professionalType' => $this->professionalLabel($shift->professional_type),
            'logoDataUri' => $this->companyLogoDataUri($company?->logo_path),
            'logoFilePath' => $this->companyLogoFilePath($company?->logo_path),
            'companyInitials' => $this->companyInitials($company?->name),
            'tagline' => $tagline,
        ];
    }

    private function shareImageUrl(ShiftRequest $shift, string $appUrl): string
    {
        $relativePath = route('share.turno.image', [
            'id' => $shift->id,
            'v' => $this->shareImageVersion($shift),
        ], false);

        return $appUrl . $relativePath;
    }

    private function shareImageVersion(ShiftRequest $shift): string
    {
        return md5(implode('|', [
            (string) $shift->updated_at,
            (string) $shift->company?->updated_at,
            (string) $shift->company?->logo_path,
            (string) $shift->title,
            (string) $shift->location,
            (string) $shift->starts_at,
            (string) $shift->ends_at,
        ]));
    }

    private function renderShareImageSvg(array $payload): string
    {
        return $this->viewFactory->make('share.turno-image', $payload)->render();
    }

    private function renderShareImagePng(array $payload, string $cacheRelativePath): void
    {
        $cacheAbsolutePath = Storage::disk('public')->path($cacheRelativePath);
        $cacheDirectory = dirname($cacheAbsolutePath);

        if (! is_dir($cacheDirectory)) {
            mkdir($cacheDirectory, 0775, true);
        }

        $tempPayloadPath = tempnam(sys_get_temp_dir(), 'ft-share-payload-');
        if ($tempPayloadPath === false) {
            throw new \RuntimeException('No se pudo crear el archivo temporal del payload.');
        }

        $tempPngPath = tempnam(sys_get_temp_dir(), 'ft-share-png-');
        if ($tempPngPath === false) {
            @unlink($tempPayloadPath);
            throw new \RuntimeException('No se pudo crear el archivo temporal PNG.');
        }

        file_put_contents($tempPayloadPath, json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

        try {
            $this->runShareImageRenderer($tempPayloadPath, $tempPngPath);
            Storage::disk('public')->put($cacheRelativePath, file_get_contents($tempPngPath) ?: '');
        } finally {
            @unlink($tempPayloadPath);
            @unlink($tempPngPath);
        }
    }

    private function runShareImageRenderer(string $inputPath, string $outputPath): void
    {
        $pythonBinary = $this->resolvePythonBinary();
        $scriptPath = base_path('bin/render_share_image.py');

        $command = escapeshellarg($pythonBinary) . ' '
            . escapeshellarg($scriptPath) . ' '
            . escapeshellarg($inputPath) . ' '
            . escapeshellarg($outputPath);

        $descriptorSpec = [
            0 => ['pipe', 'r'],
            1 => ['pipe', 'w'],
            2 => ['pipe', 'w'],
        ];

        $process = proc_open($command, $descriptorSpec, $pipes, base_path());
        if (! is_resource($process)) {
            throw new \RuntimeException('No se pudo iniciar el renderer de imagen.');
        }

        fclose($pipes[0]);
        $stdout = stream_get_contents($pipes[1]) ?: '';
        fclose($pipes[1]);
        $stderr = stream_get_contents($pipes[2]) ?: '';
        fclose($pipes[2]);

        $exitCode = proc_close($process);
        if ($exitCode !== 0) {
            throw new \RuntimeException(trim($stderr ?: $stdout ?: 'Renderer PNG sin salida.'));
        }
    }

    private function resolvePythonBinary(): string
    {
        $configured = env('SHARE_IMAGE_PYTHON_BINARY');
        if ($configured) {
            return $configured;
        }

        $bundled = '/mnt/c/Users/USUARIO/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
        if (is_file($bundled)) {
            return $bundled;
        }

        return 'python3';
    }

    private function professionalLabel(?string $type): string
    {
        return match ($type) {
            'pharmacist' => 'Quimico farmaceutico',
            'pharmacy_technician' => 'Tecnico en farmacia',
            'doctor' => 'Doctor',
            'assistant' => 'Auxiliar / apoyo',
            'nurse' => 'Enfermero/a',
            'intern' => 'Practicante',
            default => 'Profesional de salud',
        };
    }

    private function buildScheduleLabel(ShiftRequest $shift): string
    {
        $start = substr((string) $shift->starts_at, 0, 5);
        $end = substr((string) $shift->ends_at, 0, 5);

        return trim($start . ($end ? ' - ' . $end : ''));
    }

    private function companyLogoDataUri(?string $logoPath): ?string
    {
        if (! $logoPath) {
            return null;
        }

        $path = ltrim($logoPath, '/');
        if (! Storage::disk('public')->exists($path)) {
            return null;
        }

        $fullPath = Storage::disk('public')->path($path);
        $mime = mime_content_type($fullPath) ?: 'application/octet-stream';
        $contents = file_get_contents($fullPath);

        if ($contents === false) {
            return null;
        }

        return 'data:' . $mime . ';base64,' . base64_encode($contents);
    }

    private function companyLogoFilePath(?string $logoPath): ?string
    {
        if (! $logoPath) {
            return null;
        }

        $path = ltrim($logoPath, '/');
        if (! Storage::disk('public')->exists($path)) {
            return null;
        }

        return Storage::disk('public')->path($path);
    }

    private function companyInitials(?string $name): string
    {
        $words = preg_split('/\s+/', trim((string) $name)) ?: [];
        $initials = collect($words)
            ->filter()
            ->take(2)
            ->map(fn (string $word) => Str::upper(Str::substr($word, 0, 1)))
            ->implode('');

        return $initials ?: 'FT';
    }

    private function wrapText(string $text, int $maxChars, int $maxLines): array
    {
        $text = trim(preg_replace('/\s+/', ' ', $text) ?? '');
        if ($text === '') {
            return [''];
        }

        $words = preg_split('/\s+/', $text) ?: [];
        $lines = [];
        $current = '';
        $wordIndex = 0;

        foreach ($words as $index => $word) {
            $candidate = $current === '' ? $word : $current . ' ' . $word;
            if (mb_strlen($candidate) <= $maxChars) {
                $current = $candidate;
                $wordIndex = $index + 1;
                continue;
            }

            if ($current !== '') {
                $lines[] = $current;
            }

            $current = $word;
            $wordIndex = $index;
            if (count($lines) === $maxLines - 1) {
                break;
            }
        }

        if ($current !== '' && count($lines) < $maxLines) {
            $remaining = array_slice($words, $wordIndex);

            if ($remaining !== []) {
                $current = trim($current . ' ' . implode(' ', $remaining));
            }

            $lines[] = $this->truncateText($current, $maxChars);
        }

        return array_slice($lines, 0, $maxLines);
    }

    private function truncateText(string $text, int $limit): string
    {
        $text = trim(preg_replace('/\s+/', ' ', $text) ?? '');

        return Str::of($text)->limit($limit, '...')->value();
    }
}
