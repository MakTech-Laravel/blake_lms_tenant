<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreIconPickerDemoRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IconPickerDemoController extends Controller
{
    public const SESSION_KEY = 'demo.icon_picker.icon';

    public const DEFAULT_ICON = 'pen-line';

    public function index(Request $request): Response
    {
        return Inertia::render('icon-picker-demo', [
            'icon' => $request->session()->get(self::SESSION_KEY, self::DEFAULT_ICON),
        ]);
    }

    public function store(StoreIconPickerDemoRequest $request): RedirectResponse
    {
        $icon = $request->validated('icon');

        $request->session()->put(self::SESSION_KEY, $icon);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Icon saved successfully.',
        ]);

        return to_route('icon-picker-demo.index');
    }
}
